'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/login?error=' + encodeURIComponent('Invalid login details.'))
  }

  redirect(redirectTo)
}
