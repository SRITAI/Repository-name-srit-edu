import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { validateDeviceSession, clearDeviceTokenCookie } from '@/lib/auth/session'

// Defense-in-depth: middleware.ts already blocks unauthenticated
// requests to /dashboard/*, this is the page-level check behind it,
// which also validates that this device session is active and unrevoked.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard')
  }

  // Check user role: students must have an active, unrevoked device session
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'employee') {
    redirect('/employee/dashboard')
  }

  if (!profile || profile.role === 'student') {
    const sessionCheck = await validateDeviceSession(user.id)
    if (!sessionCheck.valid) {
      await supabase.auth.signOut()
      clearDeviceTokenCookie()
      redirect(
        '/login?error=' +
          encodeURIComponent('This device has been logged out or its session has expired.')
      )
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="container grid gap-8 py-10 md:grid-cols-1 md:grid-cols-[220px_1fr]">
      <DashboardNav isAdmin={isAdmin} />
      <div>{children}</div>
    </div>
  )
}
