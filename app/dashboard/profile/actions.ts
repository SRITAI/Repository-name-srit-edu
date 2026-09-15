'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfileAction(formData: FormData) {
  const fullName = String(formData.get('fullName') || '').trim()

  if (!fullName) {
    redirect('/dashboard/profile?error=' + encodeURIComponent('Name cannot be empty.'))
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    redirect('/dashboard/profile?error=' + encodeURIComponent('Could not update your profile.'))
  }

  revalidatePath('/dashboard/profile')
  redirect('/dashboard/profile?success=1')
}

export async function updatePasswordAction(formData: FormData) {
  const newPassword = String(formData.get('newPassword') || '')
  const confirmNewPassword = String(formData.get('confirmNewPassword') || '')

  if (newPassword.length < 8) {
    redirect('/dashboard/profile?pwError=' + encodeURIComponent('Password must be at least 8 characters.'))
  }
  if (newPassword !== confirmNewPassword) {
    redirect('/dashboard/profile?pwError=' + encodeURIComponent('Passwords do not match.'))
  }

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    redirect('/dashboard/profile?pwError=' + encodeURIComponent(error.message))
  }

  redirect('/dashboard/profile?pwSuccess=1')
}
