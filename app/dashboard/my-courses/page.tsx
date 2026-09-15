import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function MyCoursesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // RLS already restricts this to the caller's own rows; the .eq(user_id)
  // filter here is a second, explicit guarantee of the same thing.
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, granted_at, courses(id, title, category, languages)')
    .eq('user_id', user!.id)
    .eq('status', 'active')
    .order('granted_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-900">My Courses</h1>

      {!enrollments?.length && (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-200 p-8 text-center">
          <p className="text-neutral-600">You haven&apos;t enrolled in any courses yet.</p>
          <Link href="/courses" className="mt-3 inline-block text-sm font-medium text-blue-500">
            Browse courses →
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {enrollments?.map((enrollment: any) => {
          const course = enrollment.courses as any
          if (!course) return null
          return (
            <div key={enrollment.id} className="rounded-lg border border-neutral-100 p-5">
              <p className="text-xs font-medium text-blue-500">{course.category?.toUpperCase()}</p>
              <h2 className="mt-1 font-semibold text-navy-900">{course.title}</h2>
              <p className="mt-1 text-sm text-neutral-600">
                {(course.languages as string[])
                  .map((l) => (l === 'hi' ? 'Hindi' : 'English'))
                  .join(', ')}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
