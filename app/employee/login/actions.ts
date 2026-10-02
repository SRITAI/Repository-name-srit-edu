'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function employeeLoginAction(formData: FormData) {
  const identifier = String(formData.get('identifier') || '').trim()
  const password = String(formData.get('password') || '')

  if (!identifier || !password) {
    redirect(
      '/employee/login?error=' +
        encodeURIComponent('Please enter your email or mobile number and password.')
    )
  }

  let email = identifier

  // If identifier is not an email, resolve it as a mobile number via admin lookup
  if (!identifier.includes('@')) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('profiles')
      .select('email')
      .eq('mobile_number', identifier)
      .maybeSingle()

    if (!data?.email) {
      redirect('/employee/login?error=' + encodeURIComponent('Invalid login credentials.'))
    }
    email = data.email
  }

  const supabase = createClient()
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !authData?.user) {
    redirect('/employee/login?error=' + encodeURIComponent('Invalid login credentials.'))
  }

  const admin = createAdminClient()

  // 1. Authorize role: strictly require role === 'employee'
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (!profile || profile.role !== 'employee') {
    // If student or non-employee attempts to log in here, sign them out immediately
    await supabase.auth.signOut()
    redirect(
      '/employee/login?error=' +
        encodeURIComponent('Access denied. This portal is for SRIT EDU employees only.')
    )
  }

  // 2. Authorize employee status in employee_profiles
  const { data: empProfile } = await (admin as any)
    .from('employee_profiles')
    .select('status')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (!empProfile) {
    await supabase.auth.signOut()
    redirect(
      '/employee/login?error=' +
        encodeURIComponent('Employee profile record not found. Please contact administration.')
    )
  }

  if (empProfile.status !== 'active') {
    await supabase.auth.signOut()
    redirect(
      '/employee/login?error=' +
        encodeURIComponent('Your employee account is currently inactive. Please contact administration.')
    )
  }

  // 3. Authorized employee -> redirect to employee portal entry
  redirect('/employee')
}
