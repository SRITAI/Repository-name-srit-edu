'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim()

  if (!email) {
    redirect('/forgot-password?error=' + encodeURIComponent('Enter your email address.'))
  }

  const supabase = createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?type=recovery&next=/reset-password`,
  })

  // Same message whether or not the email is registered, so this form
  // can't be used to check which emails have an account.
  redirect(
    '/forgot-password?message=' +
      encodeURIComponent('If an account exists for that email, a reset link has been sent.')
  )
}
