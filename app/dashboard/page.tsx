import { createClient } from '@/lib/supabase/server'
import { DashboardCard } from '@/components/dashboard/dashboard-card'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const { count: enrollmentCount } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('status', 'active')

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-900">
        Welcome, {profile?.full_name || 'Student'}
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          href="/dashboard/my-courses"
          title="My Courses"
          description={`${enrollmentCount ?? 0} active enrollment${enrollmentCount === 1 ? '' : 's'}`}
        />
        <DashboardCard
          href="/dashboard/orders"
          title="Order History"
          description="View your past orders and payments"
        />
        <DashboardCard
          href="/dashboard/profile"
          title="Profile"
          description="Update your account details"
        />
        <DashboardCard
          href="/scholarship"
          title="Scholarship Application"
          description="Apply for the SRIT EDU Scholarship"
        />
      </div>
    </div>
  )
}
