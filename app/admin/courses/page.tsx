import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Edit,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  deleteCourseAction,
  toggleCoursePublishAction,
} from './actions'

export default async function AdminCoursesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/admin/courses')
  }

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: courses, error } = await (supabase as any)
    .from('courses')
    .select(
      'id, slug, title, category, description, languages, price_paise, original_price_paise, is_published, ncert_based, board_focused, paper_analysis_years',
    )
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen size={28} />
              <div>
                <h1 className="text-2xl font-semibold">Courses</h1>
                <p className="text-sm text-white/70">
                  Manage SRIT EDU courses and publishing status.
                </p>
              </div>
            </div>

            <Link
              href="/admin/courses/new"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-neutral-100"
            >
              + New Course
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="font-semibold text-navy-900">All Courses</h2>
            <p className="text-sm text-neutral-500">
              {courses?.length ?? 0} courses in the database
            </p>
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              Unable to load courses right now.
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {courses.map((course: any) => (
                <div
                  key={course.id}
                  className="rounded-lg border border-neutral-200 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-blue-600">
                        {course.category}
                      </p>

                      <h3 className="mt-1 font-semibold text-navy-900">
                        {course.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      {course.is_published ? (
                        <>
                          <Eye size={15} />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff size={15} />
                          Draft
                        </>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-neutral-600">
                    {course.description || 'No description added.'}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded bg-neutral-50 p-2">
                      <span className="text-neutral-500">Languages</span>
                      <p className="mt-1 font-medium">
                        {course.languages?.join(', ') || '-'}
                      </p>
                    </div>

                    <div className="rounded bg-neutral-50 p-2">
                      <span className="text-neutral-500">Paper Analysis</span>
                      <p className="mt-1 font-medium">
                        {course.paper_analysis_years} years
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {course.ncert_based && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs">
                        <CheckCircle size={13} />
                        NCERT
                      </span>
                    )}

                    {course.board_focused && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs">
                        <CheckCircle size={13} />
                        Board Focused
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium hover:bg-neutral-50"
                    >
                      <Edit size={14} />
                      Edit
                    </Link>

                    <form action={toggleCoursePublishAction}>
                      <input
                        type="hidden"
                        name="id"
                        value={course.id}
                      />
                      <input
                        type="hidden"
                        name="is_published"
                        value={course.is_published ? 'true' : 'false'}
                      />

                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium hover:bg-neutral-50"
                      >
                        {course.is_published ? (
                          <>
                            <EyeOff size={14} />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            Publish
                          </>
                        )}
                      </button>
                    </form>

                    <form action={deleteCourseAction}>
                      <input
                        type="hidden"
                        name="id"
                        value={course.id}
                      />

                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-neutral-50 p-8 text-center">
              <BookOpen
                className="mx-auto text-neutral-400"
                size={32}
              />
              <p className="mt-3 font-medium text-neutral-700">
                No courses found
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Create your first course to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
