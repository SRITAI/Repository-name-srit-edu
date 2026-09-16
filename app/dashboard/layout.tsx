import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'

// Defense-in-depth: middleware.ts already blocks unauthenticated
// requests to /dashboard/*, this is the page-level check behind it.
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

  return (
    <div className="container grid gap-8 py-10 md:grid-cols-1 md:grid-cols-[220px_1fr]">
      <DashboardNav />
      <div>{children}</div>
    </div>
  )
}
