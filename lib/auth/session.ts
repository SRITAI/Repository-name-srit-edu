import crypto from 'crypto'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const DEVICE_COOKIE_NAME = 'srit_device_session'
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds
export const MAX_ACTIVE_DEVICES = 2

export type DeviceSession = {
  id: string
  user_id: string
  device_label: string | null
  user_agent: string | null
  ip_address: string | null
  last_active_at: string
  expires_at: string
  revoked_at: string | null
  created_at: string
}

/**
 * Parses user-agent string into a friendly, non-invasive label.
 */
export function parseDeviceLabel(ua: string | null | undefined): string {
  if (!ua) return 'Unknown Device'

  let os = 'Unknown Device'
  if (/windows/i.test(ua)) os = 'Windows'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS'
  else if (/linux/i.test(ua)) os = 'Linux'
  else if (/cros/i.test(ua)) os = 'Chrome OS'

  let browser = 'Web Browser'
  if (/edg/i.test(ua)) browser = 'Edge'
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome'
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox'
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari'
  else if (/opera|opr/i.test(ua)) browser = 'Opera'

  return `${browser} on ${os}`
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateDeviceToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Gets the current raw device token from the HttpOnly cookie.
 */
export function getDeviceTokenFromCookies(): string | null {
  try {
    const cookieStore = cookies()
    return cookieStore.get(DEVICE_COOKIE_NAME)?.value || null
  } catch {
    return null
  }
}

/**
 * Sets the HttpOnly device session cookie.
 */
export function setDeviceTokenCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set(DEVICE_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE,
  })
}

/**
 * Clears the HttpOnly device session cookie.
 */
export function clearDeviceTokenCookie() {
  try {
    const cookieStore = cookies()
    cookieStore.delete(DEVICE_COOKIE_NAME)
  } catch {
    // ignore
  }
}

/**
 * Registers or re-validates a device session for a user.
 * Enforces maximum 2 active devices for students.
 */
export async function registerDeviceSession(params: {
  userId: string
  userAgent?: string | null
  ipAddress?: string | null
  userRole?: string
  authSessionId?: string
}): Promise<{
  success: boolean
  error?: string
  sessionId?: string
  token?: string
  reused?: boolean
}> {
  const admin = createAdminClient()
  const isStudent = !params.userRole || params.userRole === 'student'
  if (isStudent && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.authSessionId || '')) {
    return { success: false, error: 'Verified student authentication session required.' }
  }

  const existingToken = getDeviceTokenFromCookies()
  const freshToken = generateDeviceToken()
  const freshTokenHash = hashToken(freshToken)
  let newToken = freshToken
  let tokenHash = freshTokenHash
  const deviceLabel = parseDeviceLabel(params.userAgent)
  const nowIso = new Date().toISOString()

  // Reuse a cookie only while its row is active. A revoked, expired, or
  // missing row keeps its old unique hash, so a fresh login needs a new token.
  if (existingToken) {
    const existingHash = hashToken(existingToken)
    const { data: activeSession, error: lookupError } = await (admin as any)
      .from('student_sessions')
      .select('id')
      .eq('user_id', params.userId)
      .eq('session_token_hash', existingHash)
      .is('revoked_at', null)
      .gt('expires_at', nowIso)
      .maybeSingle()

    if (lookupError) {
      return { success: false, error: 'Could not verify device session.' }
    }
    if (activeSession) {
      newToken = existingToken
      tokenHash = existingHash
    }
  }

  // Student registration must use the atomic, service-role-only RPC. Never
  // fall back to a write that could report success without the Auth binding.
  try {
    const { data, error } = await (admin.rpc as any)('register_device_session', {
      p_user_id: params.userId,
      p_session_token_hash: tokenHash,
      p_device_label: deviceLabel,
      p_user_agent: params.userAgent || null,
      p_ip_address: params.ipAddress || null,
      p_auth_session_id: params.authSessionId || null,
      p_max_devices: MAX_ACTIVE_DEVICES,
      ...(isStudent ? { p_fresh_session_token_hash: freshTokenHash } : {}),
    })

    if (!error && data) {
      if (data.success) {
        const registeredToken = isStudent && !data.reused ? freshToken : newToken
        setDeviceTokenCookie(registeredToken)
        return {
          success: true,
          sessionId: data.session_id,
          token: registeredToken,
          reused: Boolean(data.reused),
        }
      }

      if (data.error === 'MAX_DEVICES_REACHED') {
        return {
          success: false,
          error: 'Maximum 2 devices are already active on this account. Remove an existing device to continue.',
        }
      }
    }
  } catch {
    // Students fail closed below. Preserve the existing employee fallback.
  }

  if (isStudent) {
    return { success: false, error: 'Could not bind this device to the authenticated session.' }
  }

  // Existing non-student fallback if the RPC is unavailable.
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_COOKIE_MAX_AGE * 1000).toISOString()

  if (newToken === existingToken) {
    const { data: existingSession, error: lookupError } = await (admin as any)
      .from('student_sessions')
      .select('id, revoked_at, expires_at')
      .eq('user_id', params.userId)
      .eq('session_token_hash', tokenHash)
      .is('revoked_at', null)
      .gt('expires_at', nowIso)
      .maybeSingle()

    if (lookupError) return { success: false, error: 'Could not verify device session.' }
    if (existingSession?.id) {
      const { error: updateError } = await (admin as any)
        .from('student_sessions')
        .update({
          last_active_at: nowIso,
          expires_at: expiresAt,
          device_label: deviceLabel,
          user_agent: params.userAgent || null,
          ip_address: params.ipAddress || null,
        })
        .eq('id', existingSession.id)

      if (updateError) return { success: false, error: 'Could not update device session.' }

      setDeviceTokenCookie(newToken)
      return {
        success: true,
        sessionId: existingSession.id,
        token: newToken,
        reused: true,
      }
    }
  }

  // Employees and admins are not subject to the student two-device limit.
  const { data: inserted, error: insertErr } = await (admin as any)
    .from('student_sessions')
    .insert({
      user_id: params.userId,
      session_token_hash: tokenHash,
      device_label: deviceLabel,
      user_agent: params.userAgent || null,
      ip_address: params.ipAddress || null,
      last_active_at: nowIso,
      expires_at: expiresAt,
    })
    .select('id')
    .single()

  if (insertErr) {
    return {
      success: false,
      error: 'Failed to record device session. Please try again.',
    }
  }

  setDeviceTokenCookie(newToken)
  return {
    success: true,
    sessionId: inserted.id,
    token: newToken,
    reused: false,
  }
}

/**
 * Validates the current device session for a logged-in user.
 * Returns valid=true if the session is unrevoked and not expired.
 * Throttles last_active_at update to at most once per 15 minutes.
 */
export async function validateDeviceSession(userId: string): Promise<{
  valid: boolean
  sessionId?: string
  reason?: string
}> {
  const token = getDeviceTokenFromCookies()
  if (!token) {
    return { valid: false, reason: 'NO_TOKEN' }
  }

  const supabase = createServerClient()
  if (!('getClaims' in supabase.auth)) {
    return { valid: false, reason: 'NO_AUTH_SESSION' }
  }
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const authSessionId = claimsData?.claims.session_id
  if (claimsError || claimsData?.claims.sub !== userId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authSessionId || '')) {
    return { valid: false, reason: 'AUTH_SESSION_MISMATCH' }
  }

  const tokenHash = hashToken(token)
  const admin = createAdminClient()
  const now = new Date()
  const nowIso = now.toISOString()

  const { data: session } = await (admin as any)
    .from('student_sessions')
    .select('id, last_active_at, revoked_at, expires_at')
    .eq('user_id', userId)
    .eq('session_token_hash', tokenHash)
    .eq('auth_session_id', authSessionId)
    .maybeSingle()

  if (!session) {
    return { valid: false, reason: 'SESSION_NOT_FOUND' }
  }

  if (session.revoked_at) {
    return { valid: false, reason: 'REVOKED' }
  }

  if (session.expires_at && new Date(session.expires_at) <= now) {
    return { valid: false, reason: 'EXPIRED' }
  }

  // Throttle last_active_at updates (update only if > 15 minutes since last active)
  const lastActive = new Date(session.last_active_at).getTime()
  const fifteenMinutes = 15 * 60 * 1000
  if (now.getTime() - lastActive > fifteenMinutes) {
    await (admin as any)
      .from('student_sessions')
      .update({ last_active_at: nowIso })
      .eq('id', session.id)
  }

  return { valid: true, sessionId: session.id }
}

/**
 * Revokes a session by ID for a specific user.
 */
export async function revokeSession(sessionId: string, userId: string): Promise<boolean> {
  const admin = createAdminClient()
  const { error } = await (admin as any)
    .from('student_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', userId)

  return !error
}

/**
 * Revokes the current device's session and clears the cookie.
 */
export async function revokeCurrentDeviceSession(userId: string): Promise<void> {
  const token = getDeviceTokenFromCookies()
  if (token) {
    const tokenHash = hashToken(token)
    const admin = createAdminClient()
    await (admin as any)
      .from('student_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('session_token_hash', tokenHash)
      .eq('user_id', userId)
  }

  clearDeviceTokenCookie()
}

/**
 * Fetches all sessions for a user (for the "My Devices" dashboard view).
 */
export async function getUserSessions(userId: string): Promise<DeviceSession[]> {
  const admin = createAdminClient()
  const { data } = await (admin as any)
    .from('student_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: false })

  return (data || []) as DeviceSession[]
}
