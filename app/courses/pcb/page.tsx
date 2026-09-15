import { createClient } from '@/lib/supabase/server'
import { CourseCard } from '@/components/course/course-card'

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-neutral-100 py-4">
      <summary className="cursor-pointer list-none font-medium text-navy-900 marker:content-none">
        {q}
      </summary>
      <p className="mt-2 text-sm text-neutral-600">{a}</p>
    </details>
  )
}

export default async function PcbPage() {
  const supabase = createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*, course_subjects(id, name, sort_order)')
    .eq('category', 'pcb')
    .eq('is_published', true)
    .order('created_at')

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-semibold text-navy-900">PCB — Physics, Chemistry &amp; Biology</h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Built from five years of board paper analysis, aligned to NCERT, available in Hindi and
        English.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {courses?.length ? (
          courses.map((course) => <CourseCard key={course.id} course={course as any} />)
        ) : (
          <p className="text-neutral-600">PCB courses will be listed here once published.</p>
        )}
      </div>

      <section className="mt-16">
        <h2 className="text-xl font-semibold text-navy-900">What you&apos;ll get</h2>
        <ul className="mt-4 grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
          <li>Chapter-wise notes for Physics, Chemistry and Biology</li>
          <li>Concepts and chapters ranked by five years of board paper frequency</li>
          <li>Study material in Hindi and English</li>
          <li>NCERT-aligned, board-focused coverage</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-navy-900">FAQ</h2>
        <div className="mt-4">
          <FaqItem
            q="Is this course based on NCERT?"
            a="Yes — every chapter is built directly from the NCERT syllabus, cross-checked against the board pattern."
          />
          <FaqItem
            q="Which languages are available?"
            a="Course material is available in both Hindi and English; pick your preferred language after enrolling."
          />
          <FaqItem
            q="How is the content prepared?"
            a="Each chapter is prioritised using an analysis of the last five years of board examination papers — repeated concepts, marks distribution, and question trends."
          />
        </div>
      </section>
    </div>
  )
}
