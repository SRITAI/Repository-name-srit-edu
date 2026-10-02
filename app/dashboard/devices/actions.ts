'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { revokeSession, revokeCurrentDeviceSession } from '@/lib/auth/session'

export async function revokeDeviceAction(formData: FormData) {
  const sessionId = String(formData.get('sessionId') || '').trim()
  const isCurrent = String(formData.get('isCurrent') || '') === 'true'

  if (!sessionId) {
    throw new Error('Device session ID is required')
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard/devices')
  }

  // Revoke this specific session from database
  await revokeSession(sessionId, user.id)

  if (isCurrent) {
    // Current device revoked itself: terminate current session and log out
    await revokeCurrentDeviceSession(user.id)
    await supabase.auth.signOut()
    redirect('/login?message=' + encodeURIComponent('You have removed this device and been logged out.'))
  }

  revalidatePath('/dashboard/devices')
  redirect('/dashboard/devices?message=' + encodeURIComponent('Device removed successfully.'))
}
