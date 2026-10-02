import { NextResponse } from 'next/server'
import { SUPPORT_CONVERSATION_SELECT } from '@/lib/support/contracts'
import { authorizeEmployeeSupport } from '@/lib/support/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await authorizeEmployeeSupport()
  if (auth.response) return auth.response

  const { data, error } = await auth.supabase
    .from('support_conversations')
    .select(SUPPORT_CONVERSATION_SELECT)
    .eq('status', 'open')
    .order('updated_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ error: 'Could not load support conversations' }, { status: 500 })
  return NextResponse.json({ conversations: data ?? [] })
}
