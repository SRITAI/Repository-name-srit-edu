import { NextResponse } from 'next/server'
import { SUPPORT_MESSAGE_SELECT } from '@/lib/support/contracts'
import { authorizeStudentSupport, readMessageInput, readMessageQuery } from '@/lib/support/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const auth = await authorizeStudentSupport()
  if (auth.response) return auth.response
  const query = readMessageQuery(request)
  if (query.response) return query.response

  const { data: conversation, error: conversationError } = await auth.supabase
    .from('support_conversations')
    .select('id')
    .eq('id', query.conversationId)
    .eq('student_id', auth.userId)
    .maybeSingle()
  if (conversationError) return NextResponse.json({ error: 'Could not verify conversation' }, { status: 500 })
  if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  const { data, error } = await auth.supabase
    .from('support_messages')
    .select(SUPPORT_MESSAGE_SELECT)
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(query.offset, query.offset + 99)
  if (error) return NextResponse.json({ error: 'Could not load messages' }, { status: 500 })
  return NextResponse.json({ messages: (data ?? []).reverse(), nextOffset: data?.length === 100 ? query.offset + 100 : null })
}

export async function POST(request: Request) {
  const auth = await authorizeStudentSupport()
  if (auth.response) return auth.response
  const input = await readMessageInput(request)
  if (input.response) return input.response

  const { data: conversation, error: conversationError } = await auth.supabase
    .from('support_conversations')
    .select('id')
    .eq('id', input.conversationId)
    .eq('student_id', auth.userId)
    .eq('status', 'open')
    .maybeSingle()
  if (conversationError) return NextResponse.json({ error: 'Could not verify conversation' }, { status: 500 })
  if (!conversation) return NextResponse.json({ error: 'Open conversation not found' }, { status: 404 })

  const { data, error } = await auth.supabase
    .from('support_messages')
    .insert({ conversation_id: conversation.id, body: input.body })
    .select(SUPPORT_MESSAGE_SELECT)
    .single()
  if (error) return NextResponse.json({ error: 'Could not send message' }, { status: 500 })
  return NextResponse.json({ message: data }, { status: 201 })
}
