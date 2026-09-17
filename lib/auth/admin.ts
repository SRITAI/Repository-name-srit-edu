'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Admin authorization helper used by every admin page and server action.
// Reuses the exact check pattern from existing /admin/* pages:
//   1. Require an authenticated Supabase user
//   2. Require profiles.role === 'admin'
//   3. Redirect to login if not authenticated, or /dashboard if not admin.
export async function requireAdmin(returnTo: string = '/admin/materials') {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=' + encodeURIComponent(returnTo))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return { supabase, user }
}

export async function checkAdminServerSide() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { isAdmin: false, user: null, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { isAdmin: false, user, error: 'Not authorized' }
  }

  return { isAdmin: true, user }
}