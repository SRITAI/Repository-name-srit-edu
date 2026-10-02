import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type EmployeeProfile = {
  id: string
  employee_id: string
  referral_code: string
  department: string | null
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
  full_name: string
  email: string | null
  mobile_number: string
}

export type AuthenticatedEmployeeResult = {
  user: any
  profile: any
  employeeProfile: EmployeeProfile | null
  status: 'authenticated' | 'unauthenticated' | 'not_employee' | 'profile_missing' | 'inactive'
}

/**
 * Server-side helper to retrieve and verify an authenticated employee.
 * Checks authentication, role membership, and active employee status.
 */
export async function getAuthenticatedEmployee(): Promise<AuthenticatedEmployeeResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      profile: null,
      employeeProfile: null,
      status: 'unauthenticated',
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, mobile_number, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'employee') {
    return {
      user,
      profile,
      employeeProfile: null,
      status: 'not_employee',
    }
  }

  const admin = createAdminClient()
  const { data: empProfile } = await (admin as any)
    .from('employee_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!empProfile) {
    return {
      user,
      profile,
      employeeProfile: null,
      status: 'profile_missing',
    }
  }

  if (empProfile.status !== 'active') {
    return {
      user,
      profile,
      employeeProfile: null,
      status: 'inactive',
    }
  }

  return {
    user,
    profile,
    employeeProfile: {
      ...empProfile,
      full_name: profile.full_name,
      email: profile.email || user.email,
      mobile_number: profile.mobile_number,
    },
    status: 'authenticated',
  }
}
