import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { uploadMaterial } from '../actions'

export default async function NewMaterialPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const { supabase } = await requireAdmin('/admin/materials/new')
  const params = searchParams
  const error = typeof params.error === 'string' ? params.error : ''

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, course_subjects(id, name, sort_order, course_chapters(id, title, sort_order))')
    .order('title')

  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <div className="container max-w-3xl">
        <Link
          href="/admin/materials"
          className="mb-5 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-navy"
        >
          ← Back to Study Materials
        </Link>

        <div className="rounded-lg bg-navy p-6 text-white">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Add Study Material</h1>
              <p className="text-sm text-white/70">
                Upload a protected PDF to a course, subject and chapter.
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
          action={uploadMaterial}
          encType="multipart/form-data"
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
            <label className="text-sm font-medium text-neutral-700">Chapter</label>
            <select
              name="chapterId"
              required
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="">Select a chapter</option>
              {(courses ?? []).map((course: any) =>
                (course.course_subjects ?? []).map((subject: any) =>
                  (subject.course_chapters ?? []).map((chapter: any) => (
                    <option key={chapter.id} value={chapter.id}>
                      {course.title} — {subject.name} — {chapter.title}
                    </option>
                  ))
                )
              )}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-neutral-700">Language</label>
              <select
                name="language"
                required
                className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-blue-600"
              >
                <option value="">Select language</option>
                <option value="hi">Hindi</option>
                <option value="en">English</option>
              </select>
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
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">File Name</label>
            <input
              type="text"
              name="fileName"
              required
              placeholder="e.g. Chapter 1 Notes"
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">PDF File</label>
            <input
              type="file"
              name="file"
              accept="application/pdf,.pdf"
              required
              className="mt-2 w-full text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-600"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Only PDF files are accepted. Maximum size: 25 MB.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/materials"
              className="rounded-lg border border-neutral-300 px-5 py-3 text-center text-sm font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-navy px-5 py-3 text-sm font-medium text-white hover:bg-blue-600"
            >
              Upload PDF
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}