'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { registerDeviceSession, clearDeviceTokenCookie } from '@/lib/auth/session'

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get('identifier') || '').trim()
  const password = String(formData.get('password') || '')
  const redirectTo = String(formData.get('redirectTo') || '/dashboard')

  if (!identifier || !password) {
    redirect('/login?error=' + encodeURIComponent('Enter your email or mobile number and password.'))
  }

  let email = identifier

  if (!identifier.includes('@')) {
    // Treat the identifier as a mobile number and look up the linked email.
    // Uses the service-role client because the `profiles` RLS policy only
    // lets a user read their own row — this is a deliberate, narrow
    // exception for login lookup only.
    const admin = createAdminClient()
    const { data } = await admin
      .from('profiles')
      .select('email')
      .eq('mobile_number', identifier)
      .maybeSingle()

    if (!data?.email) {
      // Generic message — do not reveal whether the mobile number exists.
      redirect('/login?error=' + encodeURIComponent('Invalid login details.'))
    }
    email = data.email
  }

  const supabase = createClient()
  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !authData?.user) {
    redirect('/login?error=' + encodeURIComponent('Invalid login details.'))
  }

  // Device limitation enforcement for students
  const reqHeaders = headers()
  const userAgent = reqHeaders.get('user-agent')
  const ipAddress = reqHeaders.get('x-forwarded-for')?.split(',')[0].trim() || reqHeaders.get('x-real-ip')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  let authSessionId: string | undefined
  if (profile?.role === 'student') {
    const accessToken = authData.session?.access_token
    if (!accessToken || !('getClaims' in supabase.auth)) {
      await supabase.auth.signOut()
      clearDeviceTokenCookie()
      redirect('/login?error=' + encodeURIComponent('Could not verify your session. Please try again.'))
    }

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(accessToken)
    const verifiedSessionId = claimsData?.claims.session_id
    if (claimsError || claimsData?.claims.sub !== authData.user.id ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(verifiedSessionId || '')) {
      await supabase.auth.signOut()
      clearDeviceTokenCookie()
      redirect('/login?error=' + encodeURIComponent('Could not verify your session. Please try again.'))
    }
    authSessionId = verifiedSessionId
  }

  const sessionResult = await registerDeviceSession({
    userId: authData.user.id,
    userAgent,
    ipAddress,
    userRole: profile?.role || 'student',
    authSessionId,
  })

  if (!sessionResult.success) {
    // Reached maximum allowed devices: sign out immediately and block
    await supabase.auth.signOut()
    clearDeviceTokenCookie()
    redirect(
      '/login?error=' +
        encodeURIComponent(
          sessionResult.error ||
            'Maximum 2 devices are already active on this account. Remove an existing device to continue.'
        )
    )
  }

  if (profile?.role === 'employee' && redirectTo === '/dashboard') {
    redirect('/employee')
  }

  redirect(redirectTo)
}
