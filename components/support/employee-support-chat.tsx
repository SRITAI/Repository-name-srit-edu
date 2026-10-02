'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, RefreshCw, Send } from 'lucide-react'
import type { SupportConversation, SupportMessage } from '@/lib/support/contracts'
import { SUPPORT_EMPLOYEES_TOPIC, supportEmployeeTopic } from '@/lib/support/contracts'
import {
  EmployeeConversationsResponse, mergeMessages, messageFromBroadcast,
  readConversationMessages, SendMessageResponse, SupportRequestError, supportRequest,
} from '@/lib/support/browser'
import { useSupportChannel } from '@/lib/support/use-support-channel'
import { createClient } from '@/lib/supabase/client'

const CONVERSATIONS_API = '/api/support/employee/conversations'
const MESSAGES_API = '/api/support/employee/messages'

export function EmployeeSupportChat(_props: { employeeUserId: string }) {
  const [trustedEmployeeId, setTrustedEmployeeId] = useState<string | null>(null)
  const trustedEmployeeIdRef = useRef<string | null>(null)
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedRef = useRef(selectedId)
  selectedRef.current = selectedId
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sessionEnded, setSessionEnded] = useState(false)
  const [suspended, setSuspended] = useState(true)
  const [channelGeneration, setChannelGeneration] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLElement>(null)
  const requestEpochRef = useRef(0)
  const revalidationRef = useRef<{ epoch: number; promise: Promise<void> } | null>(null)
  const disconnectAllRef = useRef<() => void>(() => {})

  const clearProtected = useCallback(() => {
    requestEpochRef.current += 1
    trustedEmployeeIdRef.current = null
    selectedRef.current = null
    if (rootRef.current) rootRef.current.style.visibility = 'hidden'
    disconnectAllRef.current()
    setTrustedEmployeeId(null)
    setSuspended(true)
    setConversations([])
    setSelectedId(null)
    setMessages([])
    setDraft('')
    setError('')
    setLoadingList(true)
    setLoadingMessages(false)
    setSending(false)
  }, [])

  const endSession = useCallback(() => {
    clearProtected()
    setSessionEnded(true)
  }, [clearProtected])

  const verifyCurrentAccess = useCallback(async (epoch: number): Promise<string | null> => {
    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (epoch !== requestEpochRef.current || authError || !user) return null
      await supportRequest<EmployeeConversationsResponse>(CONVERSATIONS_API)
      if (epoch !== requestEpochRef.current) return null
      const { data: { user: stillCurrent }, error: finalError } = await supabase.auth.getUser()
      if (epoch !== requestEpochRef.current || finalError || stillCurrent?.id !== user.id) return null
      return user.id
    } catch {
      return null
    }
  }, [])

  const loadConversations = useCallback(async () => {
    const employeeId = trustedEmployeeId
    if (!employeeId || trustedEmployeeIdRef.current !== employeeId || sessionEnded || suspended) return
    const epoch = requestEpochRef.current
    const isCurrent = () => epoch === requestEpochRef.current
      && trustedEmployeeIdRef.current === employeeId
    try {
      const result = await supportRequest<EmployeeConversationsResponse>(CONVERSATIONS_API)
      if (!isCurrent()) return
      setConversations((current) => isCurrent() ? result.conversations : current)
      setSelectedId((current) => isCurrent()
        ? current && result.conversations.some((item) => item.id === current)
          ? current : result.conversations[0]?.id || null
        : current)
      setError('')
    } catch (cause) {
      if (!isCurrent()) return
      if (cause instanceof SupportRequestError && (cause.status === 401 || cause.status === 403)) {
        endSession()
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not load conversations.')
      }
    } finally {
      if (isCurrent()) setLoadingList(false)
    }
  }, [trustedEmployeeId, sessionEnded, suspended, endSession])

  const loadHistory = useCallback(async (conversationId: string) => {
    const employeeId = trustedEmployeeId
    if (!employeeId || trustedEmployeeIdRef.current !== employeeId
      || sessionEnded || suspended || selectedRef.current !== conversationId) return
    const epoch = requestEpochRef.current
    const isCurrent = () => epoch === requestEpochRef.current
      && trustedEmployeeIdRef.current === employeeId && selectedRef.current === conversationId
    setLoadingMessages(true)
    try {
      const history = await readConversationMessages(MESSAGES_API, conversationId)
      if (!isCurrent()) return
      setMessages((current) => isCurrent() ? mergeMessages(current, history) : current)
      setError('')
    } catch (cause) {
      if (epoch !== requestEpochRef.current || trustedEmployeeIdRef.current !== employeeId) return
      if (cause instanceof SupportRequestError && (cause.status === 401 || cause.status === 403)) {
        endSession()
      } else if (selectedRef.current === conversationId) {
        setError(cause instanceof Error ? cause.message : 'Could not load messages.')
      }
    } finally {
      if (isCurrent()) setLoadingMessages(false)
    }
  }, [trustedEmployeeId, sessionEnded, suspended, endSession])

  const onStudentMessage = (payload: unknown) => {
    const employeeId = trustedEmployeeIdRef.current
    const epoch = requestEpochRef.current
    if (!employeeId || employeeId !== trustedEmployeeId || suspended) return
    const message = messageFromBroadcast(payload)
    if (!message || message.sender_type !== 'student') return
    if (message.conversation_id === selectedRef.current) {
      setMessages((current) => epoch === requestEpochRef.current
        && trustedEmployeeIdRef.current === employeeId
        && selectedRef.current === message.conversation_id
        ? mergeMessages(current, [message]) : current)
    }
    void loadConversations()
  }

  const { state: sharedState, disconnect: disconnectShared } = useSupportChannel(
    trustedEmployeeId && !sessionEnded && !suspended ? SUPPORT_EMPLOYEES_TOPIC : null,
    {
      authorizeReconnect: async () => {
        const employeeId = trustedEmployeeIdRef.current
        const epoch = requestEpochRef.current
        return !!employeeId && (await verifyCurrentAccess(epoch)) === employeeId
          && epoch === requestEpochRef.current && trustedEmployeeIdRef.current === employeeId
      },
      onUnauthorized: endSession,
      onConnected: () => {
        if (trustedEmployeeIdRef.current === trustedEmployeeId && !suspended) {
          void loadConversations()
          if (selectedRef.current) void loadHistory(selectedRef.current)
        }
      },
      onConversation: () => {
        if (trustedEmployeeIdRef.current === trustedEmployeeId && !suspended) void loadConversations()
      },
      onMessage: onStudentMessage,
    },
    channelGeneration,
  )
  const { state: privateState, disconnect: disconnectPrivate } = useSupportChannel(
    trustedEmployeeId && !sessionEnded && !suspended ? supportEmployeeTopic(trustedEmployeeId) : null,
    {
      authorizeReconnect: async () => {
        const employeeId = trustedEmployeeIdRef.current
        const epoch = requestEpochRef.current
        return !!employeeId && (await verifyCurrentAccess(epoch)) === employeeId
          && epoch === requestEpochRef.current && trustedEmployeeIdRef.current === employeeId
      },
      onUnauthorized: endSession,
      onConnected: () => {
        if (trustedEmployeeIdRef.current === trustedEmployeeId && !suspended && selectedRef.current) {
          void loadHistory(selectedRef.current)
        }
      },
      onMessage: (payload) => {
        const employeeId = trustedEmployeeIdRef.current
        const epoch = requestEpochRef.current
        if (!employeeId || employeeId !== trustedEmployeeId || suspended) return
        const message = messageFromBroadcast(payload)
        if (message?.sender_type === 'employee' && message.conversation_id === selectedRef.current) {
          setMessages((current) => epoch === requestEpochRef.current
            && trustedEmployeeIdRef.current === employeeId
            && selectedRef.current === message.conversation_id
            ? mergeMessages(current, [message]) : current)
        }
      },
    },
    channelGeneration,
  )
  disconnectAllRef.current = () => {
    disconnectShared()
    disconnectPrivate()
  }

  const revalidateEmployee = useCallback((): Promise<void> => {
    const inFlight = revalidationRef.current
    if (inFlight && inFlight.epoch === requestEpochRef.current) return inFlight.promise
    clearProtected()
    setSessionEnded(false)
    const epoch = requestEpochRef.current
    const promise = (async () => {
      const supabase = createClient()
      for (let attempt = 0; attempt < 100; attempt += 1) {
        if (epoch !== requestEpochRef.current) return
        if (!supabase.realtime.getChannels().some((channel) =>
          channel.topic === 'realtime:support:employees'
          || channel.topic.startsWith('realtime:support:employee:'))) break
        await new Promise<void>((resolve) => window.setTimeout(resolve, 100))
      }
      if (epoch !== requestEpochRef.current) return
      if (supabase.realtime.getChannels().some((channel) =>
        channel.topic === 'realtime:support:employees'
        || channel.topic.startsWith('realtime:support:employee:'))) {
        endSession()
        return
      }
      const verifiedId = await verifyCurrentAccess(epoch)
      if (epoch !== requestEpochRef.current) return
      if (!verifiedId) {
        endSession()
        return
      }
      trustedEmployeeIdRef.current = verifiedId
      setTrustedEmployeeId(verifiedId)
      setSessionEnded(false)
      setSuspended(false)
      setChannelGeneration((value) => value + 1)
    })().finally(() => {
      if (revalidationRef.current?.epoch === epoch) revalidationRef.current = null
    })
    revalidationRef.current = { epoch, promise }
    return promise
  }, [clearProtected, endSession, verifyCurrentAccess])

  useEffect(() => {
    if (document.visibilityState === 'visible') void revalidateEmployee()
    let hidden = false
    const onPageHide = () => {
      hidden = true
      clearProtected()
    }
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted && !hidden) return
      hidden = false
      void revalidateEmployee()
    }
    const onBlur = () => { clearProtected() }
    const onFocus = () => {
      if (document.visibilityState === 'visible') void revalidateEmployee()
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') clearProtected()
      else void revalidateEmployee()
    }
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('pageshow', onPageShow)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pageshow', onPageShow)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [clearProtected, revalidateEmployee])

  useEffect(() => {
    const { data: { subscription } } = createClient().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        endSession()
      } else if (event === 'SIGNED_IN' && session?.user.id !== trustedEmployeeIdRef.current) {
        clearProtected()
        if (document.visibilityState === 'visible') void revalidateEmployee()
      }
    })
    return () => subscription.unsubscribe()
  }, [clearProtected, endSession, revalidateEmployee])

  useEffect(() => {
    if (rootRef.current) rootRef.current.style.visibility = ''
  }, [suspended, sessionEnded, trustedEmployeeId])

  useEffect(() => () => {
    requestEpochRef.current += 1
    trustedEmployeeIdRef.current = null
    selectedRef.current = null
    disconnectAllRef.current()
  }, [])

  useEffect(() => { if (trustedEmployeeId && !sessionEnded && !suspended) void loadConversations() },
    [trustedEmployeeId, sessionEnded, suspended, loadConversations])
  useEffect(() => {
    setMessages([])
    if (selectedId && trustedEmployeeId && !sessionEnded && !suspended) void loadHistory(selectedId)
  }, [selectedId, trustedEmployeeId, sessionEnded, suspended, loadHistory])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!trustedEmployeeId || sessionEnded || suspended) return
    const employeeId = trustedEmployeeId
    const checkSession = async () => {
      const epoch = requestEpochRef.current
      const verifiedId = await verifyCurrentAccess(epoch)
      if (epoch !== requestEpochRef.current || trustedEmployeeIdRef.current !== employeeId) return
      if (!verifiedId) endSession()
      else if (verifiedId !== employeeId) void revalidateEmployee()
      else void loadConversations()
    }
    const interval = window.setInterval(() => { void checkSession() }, 30000)
    return () => window.clearInterval(interval)
  }, [trustedEmployeeId, sessionEnded, suspended, verifyCurrentAccess, endSession, revalidateEmployee, loadConversations])

  const selected = conversations.find((item) => item.id === selectedId)

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()
    const employeeId = trustedEmployeeIdRef.current
    const conversationId = selectedId
    if (!employeeId || employeeId !== trustedEmployeeId || !conversationId
      || !body || body.length > 4000 || sending || sessionEnded || suspended) return
    const epoch = requestEpochRef.current
    const isCurrent = () => epoch === requestEpochRef.current
      && trustedEmployeeIdRef.current === employeeId && selectedRef.current === conversationId
    setSending(true)
    setError('')
    try {
      const result = await supportRequest<SendMessageResponse>(MESSAGES_API, {
        method: 'POST',
        body: JSON.stringify({ conversationId, body }),
      })
      if (!isCurrent()) return
      setMessages((current) => isCurrent() ? mergeMessages(current, [result.message]) : current)
      setDraft('')
      void loadConversations()
    } catch (cause) {
      if (epoch !== requestEpochRef.current || trustedEmployeeIdRef.current !== employeeId) return
      if (cause instanceof SupportRequestError && (cause.status === 401 || cause.status === 403)) {
        endSession()
      } else if (selectedRef.current === conversationId) {
        setError(cause instanceof Error ? cause.message : 'Reply could not be sent.')
      }
    } finally {
      if (epoch === requestEpochRef.current && trustedEmployeeIdRef.current === employeeId) setSending(false)
    }
  }

  return (
    <section ref={rootRef} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-900"><MessageCircle className="text-blue-600" /> Support chat</h1>
          <p className="mt-1 text-sm text-slate-500">Respond to students who need help.</p>
        </div>
        <button type="button" onClick={() => { void loadConversations(); if (selectedId) void loadHistory(selectedId) }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={15} /> Refresh</button>
      </div>
      {sessionEnded ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">Your employee session is no longer active. Please sign in again.</div>
      ) : suspended || !trustedEmployeeId ? (
        <div role="status" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Rechecking your employee session...</div>
      ) : (
        <>
        {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button type="button" onClick={() => { void loadConversations(); if (selectedId) void loadHistory(selectedId) }} className="font-bold underline">Retry</button></div>}
        <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 md:border-b-0 md:border-r">
            <div className="border-b border-slate-100 p-4">
              <h2 className="text-sm font-bold text-navy-900">Open conversations</h2>
              <p role="status" className="mt-1 text-xs text-slate-500">{sharedState === 'connected' && privateState === 'connected' ? 'Live updates connected' : sharedState === 'error' || privateState === 'error' ? 'Live updates unavailable. Use refresh.' : sharedState === 'reconnecting' || privateState === 'reconnecting' ? 'Reconnecting to live updates...' : 'Connecting to live updates...'}</p>
            </div>
            <div className="max-h-48 overflow-y-auto md:max-h-[560px]">
              {loadingList && <p className="p-4 text-sm text-slate-500">Loading conversations...</p>}
              {!loadingList && conversations.length === 0 && <p className="p-4 text-sm text-slate-500">No open conversations yet.</p>}
              {conversations.map((conversation) => (
                <button key={conversation.id} type="button" onClick={() => setSelectedId(conversation.id)} className={`block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-blue-50 ${selectedId === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
                  <span className="block truncate text-sm font-semibold text-navy-900">{conversation.student_display_name}</span>
                  <time className="mt-1 block text-xs text-slate-500" dateTime={conversation.updated_at}>{new Date(conversation.updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</time>
                </button>
              ))}
            </div>
          </aside>
          <div className="flex min-h-[430px] flex-col">
            {selected ? (
              <>
                <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-navy-900">{selected.student_display_name}</h2><p className="text-xs text-slate-500">Student support conversation</p></div>
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4 md:max-h-[470px]" aria-live="polite">
                  {loadingMessages && <p className="text-center text-sm text-slate-500">Loading messages...</p>}
                  {!loadingMessages && messages.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No messages in this conversation yet.</p>}
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender_type === 'employee' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${message.sender_type === 'employee' ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-navy-900'}`}>
                        <p className={`mb-1 text-xs font-bold ${message.sender_type === 'employee' ? 'text-blue-100' : 'text-blue-700'}`}>{message.sender_type === 'employee' ? 'You' : message.sender_display_name}</p>
                        <p className="whitespace-pre-wrap break-words">{message.body}</p>
                        <time className="mt-1 block text-right text-[10px] opacity-70" dateTime={message.created_at}>{new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-slate-200 p-3">
                  <textarea value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Reply to student" placeholder="Write a reply..." rows={2} maxLength={4000} disabled={sending} className="min-h-11 max-h-28 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  <button type="submit" disabled={!draft.trim() || sending} aria-label="Send reply" className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-50"><Send size={18} /></button>
                </form>
                {sending && <p role="status" className="px-4 pb-2 text-xs text-slate-500">Sending reply...</p>}
              </>
            ) : <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">Select a conversation to read and reply.</div>}
          </div>
        </div>
        </>
      )}
    </section>
  )
}
