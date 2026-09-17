import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createChapterAction } from '../actions'

export default async function NewChapterPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const { supabase } = await requireAdmin('/admin/chapters/new')
  const params = searchParams
  const error = typeof params.error === 'string' ? params.error : ''

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, course_subjects(id, name, sort_order)')
    .order('title')

  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <div className="container max-w-3xl">
        <Link
          href="/admin/chapters"
          className="mb-5 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-navy"
        >
          ← Back to Chapters
        </Link>

        <div className="rounded-lg bg-navy p-6 text-white">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Add Chapter</h1>
              <p className="text-sm text-white/70">
                Create a new chapter under a subject for study materials.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          action={createChapterAction}
          className="mt-6 space-y-6 rounded-lg border border-neutral-200 bg-white p-6"
        >
          <div>
            <label className="text-sm font-medium text-neutral-700">Course</label>
            <select
              name="courseId"
              required
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="">Select a course</option>
              {(courses ?? []).map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">Subject</label>
            <select
              name="subjectId"
              required
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="">Select a subject</option>
              {(courses ?? []).map((course: any) =>
                (course.course_subjects ?? []).map((subject: any) => (
                  <option key={subject.id} value={subject.id}>
                    {course.title} — {subject.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">Chapter Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Chapter 1: Some Title"
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">Sort Order</label>
            <input
              type="number"
              name="sortOrder"
              defaultValue={0}
              min={0}
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-blue-600"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Lower numbers appear first. Use 0, 1, 2, etc.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/chapters"
              className="rounded-lg border border-neutral-300 px-5 py-3 text-center text-sm font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-navy px-5 py-3 text-sm font-medium text-white hover:bg-blue-600"
            >
              Create Chapter
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}