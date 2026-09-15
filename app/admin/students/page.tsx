import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AdminStudentsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/admin/students')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: students, error } = await supabase
    .from('profiles')
    .select('id, full_name, mobile_number, email, role, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <div className="container">
        <Link
          href="/admin"
          className="mb-5 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-navy"
        >
          <ArrowLeft size={16} />
          Back to Admin Dashboard
        </Link>

        <div className="rounded-lg bg-navy p-6 text-white">
          <div className="flex items-center gap-3">
            <Users size={28} />
            <div>
              <h1 className="text-2xl font-semibold">Students</h1>
              <p className="text-sm text-white/70">
                Manage registered students and profiles.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-navy-900">
                All Students
              </h2>
              <p className="text-sm text-neutral-500">
                {students?.length ?? 0} registered profiles
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 sm:flex">
              <Search size={16} className="text-neutral-400" />
              <span className="text-sm text-neutral-400">
                Search coming soon
              </span>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              Unable to load students right now.
            </div>
          ) : students && students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-3 py-3 font-semibold">Name</th>
                    <th className="px-3 py-3 font-semibold">Mobile</th>
                    <th className="px-3 py-3 font-semibold">Email</th>
                    <th className="px-3 py-3 font-semibold">Role</th>
                    <th className="px-3 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student: any) => (
                    <tr
                      key={student.id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="px-3 py-4 font-medium">
                        {student.full_name}
                      </td>
                      <td className="px-3 py-4">
                        {student.mobile_number}
                      </td>
                      <td className="px-3 py-4">
                        {student.email || '—'}
                      </td>
                      <td className="px-3 py-4 capitalize">
                        {student.role}
                      </td>
                      <td className="px-3 py-4">
                        {new Date(student.created_at).toLocaleDateString(
                          'en-IN'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg bg-neutral-50 p-8 text-center">
              <Users className="mx-auto text-neutral-400" size={32} />
              <p className="mt-3 font-medium text-neutral-700">
                No students found
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Registered students will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
