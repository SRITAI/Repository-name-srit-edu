import Link from 'next/link'
import { BookOpen, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react'
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

export function CourseCard({ course }: { course: Course }) {
  const isFree = course.price_paise === 0
  const hasDiscount =
    !isFree &&
    course.original_price_paise &&
    course.original_price_paise > course.price_paise

  const discountPercent = hasDiscount
    ? Math.round(
        ((course.original_price_paise! - course.price_paise) /
          course.original_price_paise!) *
          100
      )
    : 0

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10">
      <div>
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {course.ncert_based && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
              <CheckCircle2 className="h-3 w-3 text-blue-600" />
              NCERT Based
            </span>
          )}
          {course.board_focused && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200/80">
              <BookOpen className="h-3 w-3 text-slate-600" />
              Board Focused
            </span>
          )}
          {course.paper_analysis_years > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/60">
              <Sparkles className="h-3 w-3 text-amber-600" />
              {course.paper_analysis_years}-Yr Analysis
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="mt-4 text-xl font-bold tracking-tight text-navy-900 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Subjects */}
        {!!course.course_subjects?.length && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {course.course_subjects.map((s) => (
              <span
                key={s.id}
                className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200/60"
              >
                {s.name}
              </span>
            ))}
          </div>
        )}

        {/* Languages */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Medium:</span>
          <div className="flex gap-1.5">
            {course.languages.map((lang) => (
              <span
                key={lang}
                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700"
              >
                {lang === 'hi' ? 'Hindi' : 'English'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-navy-900 tracking-tight">
              {isFree ? 'Free' : formatPaise(course.price_paise)}
            </span>
            {hasDiscount && (
              <span className="text-sm font-medium text-slate-400 line-through">
                {formatPaise(course.original_price_paise!)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="text-[11px] font-bold text-emerald-600">
              Save {discountPercent}% today
            </span>
          )}
        </div>

        <Link
          href={`/checkout/${course.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-navy-700 hover:shadow-md active:scale-95 group-hover:bg-blue-600"
        >
          <span>{isFree ? 'Enroll Free' : 'Buy Now'}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
