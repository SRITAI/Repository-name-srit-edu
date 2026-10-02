import { NextResponse } from 'next/server'
import { validateDeviceSession } from '@/lib/auth/session'
import { getAuthenticatedEmployee } from '@/lib/employee/auth'
import { createClient } from '@/lib/supabase/server'

type SupportClient = ReturnType<typeof createClient>
type Authorized = { supabase: SupportClient; userId: string; response?: never }
type Rejected = { response: NextResponse; supabase?: never; userId?: never }
export type SupportAuthorization = Authorized | Rejected

const reject = (status: number, error: string): Rejected => ({
  response: NextResponse.json({ error }, { status }),
})

export async function authorizeStudentSupport(): Promise<SupportAuthorization> {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return reject(401, 'Authentication required')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profileError || profile?.role !== 'student') return reject(403, 'Student access required')

  const device = await validateDeviceSession(user.id)
  if (!device.valid) return reject(401, 'Student device session is no longer active')

  return { supabase, userId: user.id }
}

export async function authorizeEmployeeSupport(): Promise<SupportAuthorization> {
  // The existing helper checks auth.getUser(), profiles.role, and active status.
  // Its admin lookup is for authentication only, never chat data.
  const employee = await getAuthenticatedEmployee()
  if (employee.status === 'unauthenticated') return reject(401, 'Authentication required')
  if (employee.status !== 'authenticated' || !employee.user) {
    return reject(403, 'Active employee access required')
  }

  return { supabase: createClient(), userId: employee.user.id }
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export async function readMessageInput(request: Request): Promise<
  { conversationId: string; body: string; response?: never } |
  { response: NextResponse; conversationId?: never; body?: never }
> {
  let input: unknown
  try {
    input = await request.json()
  } catch {
    return reject(400, 'Invalid JSON body')
  }

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return reject(400, 'Invalid message input')
  }

  const { conversationId, body } = input as Record<string, unknown>
  if (!isUuid(conversationId) || typeof body !== 'string') {
    return reject(400, 'Conversation ID and message body are required')
  }

  const trimmedBody = body.trim()
  if (trimmedBody.length < 1 || trimmedBody.length > 4000) {
    return reject(400, 'Message must contain 1 to 4000 characters')
  }

  return { conversationId, body: trimmedBody }
}

export function readMessageQuery(request: Request):
  { conversationId: string; offset: number; response?: never } |
  { response: NextResponse; conversationId?: never; offset?: never } {
  const params = new URL(request.url).searchParams
  const conversationId = params.get('conversationId')
  const rawOffset = params.get('offset') ?? '0'
  const offset = Number(rawOffset)
  if (!isUuid(conversationId) || !/^\d+$/.test(rawOffset) ||
      !Number.isSafeInteger(offset) || offset > 100000) {
    return reject(400, 'Valid conversationId and offset are required')
  }
  return { conversationId, offset }
}
