import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CourseCard } from '@/components/course/course-card'

export default async function CoursesPage() {
  const supabase = createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*, course_subjects(id, name)')
    .eq('is_published', true)
    .order('created_at')

  const pcm = courses?.filter((c) => c.category === 'pcm') ?? []
  const pcb = courses?.filter((c) => c.category === 'pcb') ?? []

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-semibold text-navy-900">Courses</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        NCERT-based PCM and PCB preparation, built from five years of board exam analysis.
      </p>

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-navy-900">PCM — Physics, Chemistry, Mathematics</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {pcm.length ? (
            pcm.map((course) => <CourseCard key={course.id} course={course as any} />)
          ) : (
            <p className="text-sm text-neutral-600">PCM courses will appear here once published.</p>
          )}
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-xl font-semibold text-navy-900">PCB — Physics, Chemistry, Biology</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {pcb.length ? (
            pcb.map((course) => <CourseCard key={course.id} course={course as any} />)
          ) : (
            <p className="text-sm text-neutral-600">PCB courses will appear here once published.</p>
          )}
        </div>
      </div>

      <div className="mt-14 rounded-lg border border-neutral-200 p-6">
        <h2 className="font-semibold text-navy-900">Looking for question papers instead?</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Browse board-focused unsolved question papers by year and subject.
        </p>
        <Link href="/question-papers" className="mt-3 inline-block text-sm font-medium text-blue-500">
          View question papers →
        </Link>
      </div>
    </div>
  )
}
