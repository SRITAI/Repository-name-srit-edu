import { NextResponse } from 'next/server'
import { SUPPORT_CONVERSATION_SELECT } from '@/lib/support/contracts'
import { authorizeStudentSupport } from '@/lib/support/server'

export const dynamic = 'force-dynamic'

async function findOpenConversation(supabase: Awaited<ReturnType<typeof authorizeStudentSupport>>['supabase'], userId: string) {
  return supabase!
    .from('support_conversations')
    .select(SUPPORT_CONVERSATION_SELECT)
    .eq('student_id', userId)
    .eq('status', 'open')
    .maybeSingle()
}

export async function GET() {
  const auth = await authorizeStudentSupport()
  if (auth.response) return auth.response

  const { data, error } = await findOpenConversation(auth.supabase, auth.userId)
  if (error) return NextResponse.json({ error: 'Could not load support conversation' }, { status: 500 })
  return NextResponse.json({ conversation: data })
}

export async function POST() {
  const auth = await authorizeStudentSupport()
  if (auth.response) return auth.response

  const existing = await findOpenConversation(auth.supabase, auth.userId)
  if (existing.error) return NextResponse.json({ error: 'Could not load support conversation' }, { status: 500 })
  if (existing.data) return NextResponse.json({ conversation: existing.data })

  // The trigger derives student identity from auth.uid(); the column value is
  // supplied only because migration 0008 grants INSERT on student_id alone.
  const { data, error } = await auth.supabase
    .from('support_conversations')
    .insert({ student_id: auth.userId })
    .select(SUPPORT_CONVERSATION_SELECT)
    .single()

  if (!error) return NextResponse.json({ conversation: data }, { status: 201 })

  // Concurrent opens are serialized by the one-open-conversation unique index.
  if (error.code === '23505') {
    const winner = await findOpenConversation(auth.supabase, auth.userId)
    if (!winner.error && winner.data) return NextResponse.json({ conversation: winner.data })
  }
  return NextResponse.json({ error: 'Could not open support conversation' }, { status: 500 })
}
