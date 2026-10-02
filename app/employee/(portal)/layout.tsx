import { redirect } from 'next/navigation'
import { getAuthenticatedEmployee } from '@/lib/employee/auth'
import { EmployeeNav } from '@/components/employee/employee-nav'

export default async function EmployeePortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await getAuthenticatedEmployee()

  // 1. Unauthenticated -> redirect to employee login
  if (result.status === 'unauthenticated') {
    redirect('/employee/login?redirectTo=/employee')
  }

  // 2. Student (or non-employee) -> redirect to student dashboard
  // Requirement 7: If a student tries to access /employee/*: redirect to /dashboard.
  if (result.status === 'not_employee') {
    redirect('/dashboard')
  }

  // 3. Employee profile missing
  if (result.status === 'profile_missing') {
    redirect(
      '/employee/login?error=' +
        encodeURIComponent('Your employee profile has not been configured yet. Please contact administration.')
    )
  }

  // 4. Inactive employee account
  if (result.status === 'inactive') {
    redirect(
      '/employee/login?error=' +
        encodeURIComponent('Your employee account is currently inactive. Please contact administration.')
    )
  }

  const { employeeProfile } = result

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <EmployeeNav
        fullName={employeeProfile?.full_name || 'Employee'}
        employeeId={employeeProfile?.employee_id || 'SRIT-EMP'}
      />
      <main className="flex-1 py-8 sm:py-10">
        <div className="container px-4 sm:px-6 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
