import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { updateChapterAction } from '../../actions'

export default async function EditChapterPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: Record<string, string | string[] | undefined>
}) {
  const { supabase } = await requireAdmin('/admin/chapters')

  const paramsObj = searchParams
  const error = typeof paramsObj.error === 'string' ? paramsObj.error : ''

  const { data: chapter, error: chapterErr } = await supabase
    .from('course_chapters')
    .select('id, title, sort_order, course_subject_id, course_subjects(id, name, course_id, courses(id, title))')
    .eq('id', params.id)
    .single()

  if (chapterErr || !chapter) {
    redirect('/admin/chapters')
  }

  const currentSubjectId = chapter.course_subject_id
  const currentCourseId = chapter.course_subjects?.course_id ?? ''
  const currentCourseTitle = chapter.course_subjects?.courses?.title ?? ''
  const currentSubjectName = chapter.course_subjects?.name ?? ''

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, course_subjects(id, name, course_id)')
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
              <h1 className="text-2xl font-semibold">Edit Chapter</h1>
              <p className="text-sm text-white/70">
                Update chapter details and course/subject assignment.
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
          action={updateChapterAction}
          className="mt-6 space-y-6 rounded-lg border border-neutral-200 bg-white p-6"
        >
          <input type="hidden" name="id" value={chapter.id} />

          <div>
            <label className="text-sm font-medium text-neutral-700">Course</label>
            <select
              name="courseId"
              required
              defaultValue={currentCourseId}
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
              defaultValue={currentSubjectId}
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
            {currentCourseId && currentSubjectId && (
              <p className="mt-1 text-xs text-neutral-500">
                Currently: {currentCourseTitle} — {currentSubjectName}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">Chapter Title</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={chapter.title}
              placeholder="e.g. Chapter 1: Some Title"
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">Sort Order</label>
            <input
              type="number"
              name="sortOrder"
              defaultValue={chapter.sort_order}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}