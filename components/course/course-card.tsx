import Link from 'next/link'
import { formatPaise } from '@/lib/format'

type Course = {
  id: string
  title: string
  description: string | null
  languages: string[]
  price_paise: number
  original_price_paise: number | null
  ncert_based: boolean
  board_focused: boolean
  paper_analysis_years: number
  course_subjects?: { id: string; name: string }[]
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-navy-700">
      {children}
    </span>
  )
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-6">
      <div className="flex flex-wrap gap-2">
        {course.ncert_based && <Badge>NCERT Based</Badge>}
        {course.board_focused && <Badge>Board Focused</Badge>}
        <Badge>{course.paper_analysis_years}-Year Paper Analysis</Badge>
      </div>

      <h3 className="mt-3 text-lg font-semibold text-navy-900">{course.title}</h3>
      {course.description && (
        <p className="mt-1 text-sm text-neutral-600">{course.description}</p>
      )}

      {!!course.course_subjects?.length && (
        <p className="mt-3 text-sm text-neutral-600">
          {course.course_subjects.map((s) => s.name).join(' • ')}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {course.languages.map((lang) => (
          <span
            key={lang}
            className="rounded-full border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-600"
          >
            {lang === 'hi' ? 'Hindi' : 'English'}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <span className="text-xl font-semibold text-navy-900">
            {formatPaise(course.price_paise)}
          </span>
          {course.original_price_paise && course.original_price_paise > course.price_paise && (
            <span className="ml-2 text-sm text-neutral-400 line-through">
              {formatPaise(course.original_price_paise)}
            </span>
          )}
        </div>
        <Link
          href={`/checkout/${course.id}`}
          className="rounded bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Buy Now
        </Link>
      </div>
    </div>
  )
}
