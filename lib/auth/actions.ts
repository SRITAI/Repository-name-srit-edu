'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revokeCurrentDeviceSession, clearDeviceTokenCookie } from '@/lib/auth/session'

export async function logoutAction() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await revokeCurrentDeviceSession(user.id)
  } else {
    clearDeviceTokenCookie()
  }

  await supabase.auth.signOut()
  redirect('/')
}
