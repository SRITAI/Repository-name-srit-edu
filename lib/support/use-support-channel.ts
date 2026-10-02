'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { SUPPORT_CONVERSATION_EVENT, SUPPORT_MESSAGE_EVENT } from './contracts'

export type ChannelState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'
type Callbacks = {
  onMessage?: (payload: unknown) => void
  onConversation?: (payload: unknown) => void
  onConnected?: () => void
  authorizeReconnect?: () => Promise<boolean>
  onUnauthorized?: () => void
}

// A topic has one local owner. Supabase still applies private-channel RLS.
const activeTopics = new Map<string, () => Promise<void>>()

export function useSupportChannel(topic: string | null, callbacks: Callbacks, generation = 0) {
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks
  const stopRef = useRef<() => Promise<void>>(() => Promise.resolve())
  const retryCountRef = useRef(0)
  const [retryGeneration, setRetryGeneration] = useState(0)
  const [state, setState] = useState<ChannelState>('idle')

  useEffect(() => { retryCountRef.current = 0 }, [topic, generation])

  useEffect(() => {
    if (!topic) {
      setState('idle')
      return
    }

    const supabase = createClient()
    let channel: RealtimeChannel | null = null
    let stopped = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let removal: Promise<void> | null = null
    setState('connecting')

    const stop = (): Promise<void> => {
      if (removal) return removal
      stopped = true
      if (retryTimer) clearTimeout(retryTimer)
      if (activeTopics.get(topic) === stop) activeTopics.delete(topic)
      const oldChannel = channel
      channel = null
      removal = oldChannel
        ? supabase.removeChannel(oldChannel).then(() => undefined).catch(() => undefined)
        : Promise.resolve()
      setState('idle')
      return removal
    }
    const previousStop = activeTopics.get(topic)
    activeTopics.set(topic, stop)
    stopRef.current = stop

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (stopped) return
      if (event === 'SIGNED_OUT') {
        void stop()
        callbacksRef.current.onUnauthorized?.()
      }
      if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        supabase.realtime.setAuth(session.access_token)
      }
    })

    const onPageHide = () => { void stop() }
    window.addEventListener('pagehide', onPageHide)

    void (async () => {
      if (previousStop) await previousStop()
      if (stopped) return
      const { data: { session }, error } = await supabase.auth.getSession()
      if (stopped) return
      if (error || !session?.access_token) {
        setState('error')
        return
      }
      supabase.realtime.setAuth(session.access_token)
      channel = supabase.channel(topic, { config: { private: true } })
        .on('broadcast', { event: SUPPORT_MESSAGE_EVENT }, ({ payload }) => {
          if (!stopped) callbacksRef.current.onMessage?.(payload)
        })
        .on('broadcast', { event: SUPPORT_CONVERSATION_EVENT }, ({ payload }) => {
          if (!stopped) callbacksRef.current.onConversation?.(payload)
        })
        .subscribe((status) => {
          if (stopped) return
          if (status === 'SUBSCRIBED') {
            setState('connected')
            callbacksRef.current.onConnected?.()
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setState('reconnecting')
          } else if (status === 'CLOSED') {
            if (retryTimer) return
            if (retryCountRef.current >= 3) {
              setState('error')
              return
            }
            retryCountRef.current += 1
            setState('reconnecting')
            retryTimer = setTimeout(() => {
              void (async () => {
                const authorized = await callbacksRef.current.authorizeReconnect?.()
                if (stopped) return
                if (!authorized) {
                  await stop()
                  callbacksRef.current.onUnauthorized?.()
                  return
                }
                await stop()
                setRetryGeneration((value) => value + 1)
              })().catch(() => { if (!stopped) setState('error') })
            }, 1000 * 2 ** (retryCountRef.current - 1))
          }
        })
    })().catch(() => { if (!stopped) setState('error') })

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('pagehide', onPageHide)
      void stop()
    }
  }, [topic, generation, retryGeneration])

  const disconnect = useCallback(() => { void stopRef.current() }, [])
  return { state, disconnect }
}
