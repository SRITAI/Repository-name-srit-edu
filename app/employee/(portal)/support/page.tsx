import { EmployeeSupportChat } from '@/components/support/employee-support-chat'
import { getAuthenticatedEmployee } from '@/lib/employee/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EmployeeSupportPage() {
  const employee = await getAuthenticatedEmployee()
  if (employee.status !== 'authenticated' || !employee.user) redirect('/employee/login')
  return <EmployeeSupportChat employeeUserId={employee.user.id} />
}
