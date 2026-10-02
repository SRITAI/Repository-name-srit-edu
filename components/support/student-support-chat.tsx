'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Send, X } from 'lucide-react'
import type { SupportConversation, SupportMessage } from '@/lib/support/contracts'
import { supportStudentTopic } from '@/lib/support/contracts'
import {
  mergeMessages, messageFromBroadcast, readConversationMessages,
  SendMessageResponse, StudentConversationResponse, SupportRequestError, supportRequest,
} from '@/lib/support/browser'
import { useSupportChannel } from '@/lib/support/use-support-channel'
import { createClient } from '@/lib/supabase/client'

const CONVERSATION_API = '/api/support/student/conversation'
const MESSAGES_API = '/api/support/student/messages'

export function StudentSupportChat(_props: { studentUserId?: string }) {
  const [open, setOpen] = useState(false)
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)
  const currentStudentIdRef = useRef<string | null>(null)
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const conversationRef = useRef<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sessionEnded, setSessionEnded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const requestEpochRef = useRef(0)
  const [suspended, setSuspended] = useState(true)
  const revalidationRef = useRef<{ epoch: number; promise: Promise<void> } | null>(null)
  const openRef = useRef(false)
  const [channelGeneration, setChannelGeneration] = useState(0)

  const clearChatData = useCallback(() => {
    requestEpochRef.current += 1
    currentStudentIdRef.current = null
    setCurrentStudentId(null)
    setSuspended(true)
    conversationRef.current = null
    setConversation(null)
    setMessages([])
    setDraft('')
    setError('')
    setLoading(false)
    setSending(false)
  }, [])

  const clearProtected = useCallback(() => {
    if (rootRef.current) rootRef.current.style.visibility = 'hidden'
    clearChatData()
  }, [clearChatData])

  const endSession = useCallback(() => {
    clearProtected()
    setSessionEnded(true)
  }, [clearProtected])

  const verifyCurrentAccess = useCallback(async (epoch: number): Promise<string | null> => {
    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (epoch !== requestEpochRef.current || authError || !user) return null
      await supportRequest<StudentConversationResponse>(CONVERSATION_API)
      if (epoch !== requestEpochRef.current) return null
      const { data: { user: stillCurrent }, error: finalError } = await supabase.auth.getUser()
      if (epoch !== requestEpochRef.current || finalError || stillCurrent?.id !== user.id) return null
      return user.id
    } catch {
      return null
    }
  }, [])

  const loadConversation = useCallback(async () => {
    const studentId = currentStudentId
    if (!studentId || currentStudentIdRef.current !== studentId || sessionEnded || suspended) return
    const requestEpoch = requestEpochRef.current
    const isCurrent = () => requestEpoch === requestEpochRef.current
      && currentStudentIdRef.current === studentId
    setLoading(true)
    setError('')
    try {
      const { conversation: next } = await supportRequest<StudentConversationResponse>(
        CONVERSATION_API, { method: 'POST' },
      )
      if (!isCurrent()) return
      if (!next) throw new Error('Could not open the conversation.')
      const previousId = conversationRef.current?.id
      conversationRef.current = next
      setConversation((current) => isCurrent() ? next : current)
      if (previousId !== next.id) setMessages((current) => isCurrent() ? [] : current)
      const history = await readConversationMessages(MESSAGES_API, next.id)
      if (!isCurrent()) return
      setMessages((current) => isCurrent() ? mergeMessages(current, history) : current)
    } catch (cause) {
      if (!isCurrent()) return
      if (cause instanceof SupportRequestError && (cause.status === 401 || cause.status === 403)) {
        endSession()
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not connect to support.')
      }
    } finally {
      if (isCurrent()) setLoading(false)
    }
  }, [currentStudentId, sessionEnded, suspended, endSession])

  const { state: realtimeState, disconnect } = useSupportChannel(
    open && currentStudentId && !sessionEnded && !suspended ? supportStudentTopic(currentStudentId) : null,
    {
      authorizeReconnect: async () => {
        const studentId = currentStudentIdRef.current
        const epoch = requestEpochRef.current
        return !!studentId && (await verifyCurrentAccess(epoch)) === studentId
          && epoch === requestEpochRef.current && currentStudentIdRef.current === studentId
      },
      onUnauthorized: endSession,
      onConnected: () => {
        if (currentStudentIdRef.current === currentStudentId && !suspended) void loadConversation()
      },
      onConversation: () => {
        if (currentStudentIdRef.current === currentStudentId && !suspended) void loadConversation()
      },
      onMessage: (payload) => {
        if (!currentStudentId || currentStudentIdRef.current !== currentStudentId || suspended) return
        const epoch = requestEpochRef.current
        const message = messageFromBroadcast(payload)
        if (epoch === requestEpochRef.current && currentStudentIdRef.current === currentStudentId
          && message && message.conversation_id === conversationRef.current?.id) {
          setMessages((current) => epoch === requestEpochRef.current
            && currentStudentIdRef.current === currentStudentId
            && message.conversation_id === conversationRef.current?.id
            ? mergeMessages(current, [message]) : current)
        }
      },
    },
    channelGeneration,
  )

  const closeChat = () => {
    openRef.current = false
    clearProtected()
    disconnect()
    setOpen(false)
  }

  const revalidateChat = useCallback((): Promise<void> => {
    const inFlight = revalidationRef.current
    if (inFlight && inFlight.epoch === requestEpochRef.current) return inFlight.promise

    clearProtected()
    disconnect()
    setSessionEnded(false)
    const checkEpoch = requestEpochRef.current
    const promise = (async () => {
      // removeChannel is asynchronous. Wait before a new topic can be installed.
      const supabase = createClient()
      for (let attempt = 0; attempt < 100; attempt += 1) {
        if (checkEpoch !== requestEpochRef.current) return
        if (!supabase.realtime.getChannels().some((channel) =>
          channel.topic.startsWith('realtime:support:student:'))) break
        await new Promise<void>((resolve) => window.setTimeout(resolve, 100))
      }
      if (checkEpoch !== requestEpochRef.current) return
      if (supabase.realtime.getChannels().some((channel) =>
        channel.topic.startsWith('realtime:support:student:'))) {
        endSession()
        return
      }

      const verifiedId = await verifyCurrentAccess(checkEpoch)
      if (checkEpoch !== requestEpochRef.current) return
      if (!verifiedId) {
        endSession()
        return
      }
      currentStudentIdRef.current = verifiedId
      setCurrentStudentId(verifiedId)
      setSessionEnded(false)
      setSuspended(false)
      setChannelGeneration((value) => value + 1)
    })().finally(() => {
      if (revalidationRef.current?.epoch === checkEpoch) revalidationRef.current = null
    })
    revalidationRef.current = { epoch: checkEpoch, promise }
    return promise
  }, [clearProtected, disconnect, endSession, verifyCurrentAccess])

  const openChat = () => {
    openRef.current = true
    setOpen(true)
    void revalidateChat()
  }

  useEffect(() => {
    let hidden = false
    const onPageHide = () => {
      hidden = true
      clearProtected()
      disconnect()
    }
    const onPageShow = (event: PageTransitionEvent) => {
      if (!openRef.current || (!event.persisted && !hidden)) return
      hidden = false
      void revalidateChat()
    }
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [clearProtected, disconnect, revalidateChat])

  useEffect(() => {
    const { data: { subscription } } = createClient().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearProtected()
        disconnect()
        setSessionEnded(true)
      } else if (event === 'SIGNED_IN' && openRef.current
        && session?.user.id !== currentStudentIdRef.current) {
        clearProtected()
        disconnect()
        void revalidateChat()
      }
    })
    return () => subscription.unsubscribe()
  }, [clearProtected, disconnect, revalidateChat])

  useEffect(() => {
    if (rootRef.current) rootRef.current.style.visibility = ''
  }, [open, suspended, sessionEnded, currentStudentId])

  useEffect(() => () => {
    requestEpochRef.current += 1
    currentStudentIdRef.current = null
    disconnect()
  }, [disconnect])

  useEffect(() => {
    if (open && currentStudentId && !sessionEnded && !suspended) void loadConversation()
  }, [open, currentStudentId, sessionEnded, suspended, loadConversation])

  useEffect(() => {
    if (!open) return
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearProtected()
        disconnect()
      } else {
        void revalidateChat()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [open, clearProtected, disconnect, revalidateChat])

  useEffect(() => {
    if (!open || !currentStudentId || sessionEnded || suspended) return
    const studentId = currentStudentId
    const checkSession = async () => {
      const epoch = requestEpochRef.current
      if (currentStudentIdRef.current !== studentId) return
      try {
        await supportRequest<StudentConversationResponse>(CONVERSATION_API)
      } catch (cause) {
        if (epoch !== requestEpochRef.current || currentStudentIdRef.current !== studentId) return
        if (cause instanceof SupportRequestError && (cause.status === 401 || cause.status === 403)) {
          clearProtected()
          disconnect()
          setSessionEnded(true)
        }
      }
    }
    const interval = window.setInterval(() => { void checkSession() }, 30000)
    return () => window.clearInterval(interval)
  }, [open, currentStudentId, sessionEnded, suspended, clearProtected, disconnect])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()
    const studentId = currentStudentIdRef.current
    if (!studentId || studentId !== currentStudentId
      || !body || body.length > 4000 || !conversation || sending || sessionEnded || suspended) return
    const requestEpoch = requestEpochRef.current
    const isCurrent = () => requestEpoch === requestEpochRef.current
      && currentStudentIdRef.current === studentId
    setSending(true)
    setError('')
    try {
      const result = await supportRequest<SendMessageResponse>(MESSAGES_API, {
        method: 'POST',
        body: JSON.stringify({ conversationId: conversation.id, body }),
      })
      if (!isCurrent()) return
      setMessages((current) => isCurrent() ? mergeMessages(current, [result.message]) : current)
      setDraft('')
    } catch (cause) {
      if (!isCurrent()) return
      if (cause instanceof SupportRequestError && (cause.status === 401 || cause.status === 403)) {
        clearProtected()
        disconnect()
        setSessionEnded(true)
      } else {
        setError(cause instanceof Error ? cause.message : 'Message could not be sent.')
      }
    } finally {
      if (isCurrent()) setSending(false)
    }
  }

  return (
    <div ref={rootRef} className="fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6">
      {open && (
        <section aria-label="Support chat" className="mb-3 flex h-[min(580px,calc(100dvh-105px))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-[390px]">
          <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white">
            <div>
              <h2 className="text-sm font-bold">SRIT EDU Support</h2>
              <p className="text-xs text-blue-100">We’re here to help</p>
            </div>
            <button type="button" onClick={closeChat} aria-label="Close support chat" className="rounded-lg p-2 hover:bg-white/10"><X size={18} /></button>
          </div>
          {sessionEnded ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm font-semibold text-navy-900">Your device session has ended.</p>
              <Link href="/login" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Sign in again</Link>
            </div>
          ) : suspended || !currentStudentId ? (
            <div role="status" className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">Rechecking your support session...</div>
          ) : (
            <>
              <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500" role="status">
                {loading || !conversation ? 'Connecting to support...' : realtimeState === 'connected' ? 'Connected to support' : realtimeState === 'reconnecting' ? 'Reconnecting to support...' : realtimeState === 'error' ? 'Realtime unavailable. Messages can still be sent.' : 'Connecting to support...'}
              </div>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4" aria-live="polite">
                {conversation && !loading && messages.length === 0 && <p className="py-12 text-center text-sm text-slate-500">Send a message to start the conversation.</p>}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender_type === 'student' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${message.sender_type === 'student' ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-navy-900'}`}>
                      <p className={`mb-1 text-xs font-bold ${message.sender_type === 'student' ? 'text-blue-100' : 'text-blue-700'}`}>{message.sender_type === 'student' ? 'You' : message.sender_display_name}</p>
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <time className="mt-1 block text-right text-[10px] opacity-70" dateTime={message.created_at}>{new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
                    </div>
                  </div>
                ))}
              </div>
              {error && <div role="alert" className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-700">{error} <button type="button" onClick={() => void loadConversation()} className="font-bold underline">Retry</button></div>}
              <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3">
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Message support" placeholder="Write your message..." rows={2} maxLength={4000} disabled={!conversation || sending} className="min-h-11 max-h-28 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <button type="submit" disabled={!draft.trim() || !conversation || sending} aria-label="Send message" className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-50"><Send size={18} /></button>
              </form>
              {sending && <p role="status" className="px-4 pb-2 text-xs text-slate-500">Sending message...</p>}
            </>
          )}
        </section>
      )}
      <button type="button" onClick={open ? closeChat : openChat} aria-label={open ? 'Close support chat' : 'Open support chat'} className="ml-auto flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-xl hover:bg-blue-700">
        <MessageCircle size={19} /> <span>{open ? 'Close chat' : 'Chat with support'}</span>
      </button>
    </div>
  )
}
