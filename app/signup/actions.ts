'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signupAction(formData: FormData) {
  const fullName = String(formData.get('fullName') || '').trim()
  const mobileNumber = String(formData.get('mobileNumber') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const confirmPassword = String(formData.get('confirmPassword') || '')

  if (!fullName || !mobileNumber || !email || !password) {
    redirect('/signup?error=' + encodeURIComponent('Please fill in every field.'))
  }
  if (!/^[0-9]{10}$/.test(mobileNumber)) {
    redirect('/signup?error=' + encodeURIComponent('Enter a valid 10-digit mobile number.'))
  }
  if (password !== confirmPassword) {
    redirect('/signup?error=' + encodeURIComponent('Passwords do not match.'))
  }
  if (password.length < 8) {
    redirect('/signup?error=' + encodeURIComponent('Password must be at least 8 characters.'))
  }

  const supabase = createClient()

  // full_name / mobile_number are read by the handle_new_user() trigger
  // (see supabase/migrations/0001_init.sql) to populate the profiles row.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        mobile_number: mobileNumber,
      },
    },
  })

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message))
  }

  redirect(
    '/login?message=' +
      encodeURIComponent('Account created — check your email to confirm, then log in.')
  )
}
