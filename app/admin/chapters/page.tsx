import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Trash2,
  Plus,
  ChevronsUpDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { deleteChapterAction } from './actions'

type Chapter = {
  id: string
  title: string
  sort_order: number
  created_at: string
  courses?: { id: string; title: string }
  course_subjects?: { id: string; name: string }
}

export default async function AdminChaptersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const { supabase } = await requireAdmin('/admin/chapters')

  const params = searchParams
  const success = params.success === '1'
  const error = typeof params.error === 'string' ? params.error : ''

  const { data: chapters, error: loadError } = await supabase
    .from('course_chapters')
    .select(
      'id, title, sort_order, created_at, course_subjects(id, name, courses(id, title))'
    )
    .order('sort_order', { ascending: true })

  if (loadError) console.error('Chapter query failed:', loadError)
  // Transform the data for easier rendering and sort by course title, subject name, then sort_order
  const transformedChapters: Chapter[] =
    chapters
      ?.map((c: any) => ({
        id: c.id,
        title: c.title,
        sort_order: c.sort_order,
        created_at: c.created_at,
        courses: c.course_subjects?.courses
          ? { id: c.course_subjects.courses.id, title: c.course_subjects.courses.title }
          : undefined,
        course_subjects: c.course_subjects
          ? { id: c.course_subjects.id, name: c.course_subjects.name }
          : undefined,
      }))
      .sort((a: any, b: any) => {
        const courseA = a.courses?.title || ''
        const courseB = b.courses?.title || ''
        if (courseA !== courseB) return courseA.localeCompare(courseB)
        const subjectA = a.course_subjects?.name || ''
        const subjectB = b.course_subjects?.name || ''
        if (subjectA !== subjectB) return subjectA.localeCompare(subjectB)
        return a.sort_order - b.sort_order
      }) ?? []

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
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <BookOpen size={28} />
              <div>
                <h1 className="text-2xl font-semibold">Chapters</h1>
                <p className="text-sm text-white/70">
                  Manage course chapters for study materials.
                </p>
              </div>
            </div>

            <Link
              href="/admin/chapters/new"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-neutral-100 flex items-center gap-2"
            >
              <Plus size={16} />
              New Chapter
            </Link>
          </div>
        </div>

        {success && (
          <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            Operation completed successfully.
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loadError ? (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Unable to load chapters right now.
          </div>
        ) : transformedChapters.length > 0 ? (
          <div className="mt-6 rounded-lg border border-neutral-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="px-4 py-3 font-semibold text-navy-900">Course</th>
                    <th className="px-4 py-3 font-semibold text-navy-900">Subject</th>
                    <th className="px-4 py-3 font-semibold text-navy-900">Chapter</th>
                    <th className="px-4 py-3 font-semibold text-navy-900 flex items-center gap-1">
                      <ChevronsUpDown size={14} />
                      Sort Order
                    </th>
                    <th className="px-4 py-3 font-semibold text-navy-900">Created</th>
                    <th className="px-4 py-3 font-semibold text-navy-900">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {transformedChapters.map((chapter: Chapter) => (
                    <tr key={chapter.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {chapter.courses?.title || '—'}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {chapter.course_subjects?.name || '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-navy-900 whitespace-nowrap">
                        {chapter.title}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {chapter.sort_order}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {new Date(chapter.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/chapters/${chapter.id}/edit`}
                            className="text-sm font-medium text-blue-500 hover:text-blue-600 flex items-center gap-1"
                          >
                            <Edit size={14} />
                            Edit
                          </Link>

                          <form action={deleteChapterAction} className="inline-block">
                            <input type="hidden" name="id" value={chapter.id} />
                            <button
                              type="submit"
                              className="text-sm font-medium text-red-500 hover:text-red-600 bg-transparent border-none p-0 cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-neutral-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto text-neutral-400" size={32} />
            <p className="mt-3 font-medium text-neutral-700">No chapters found</p>
            <p className="mt-1 text-sm text-neutral-500">
              Create your first chapter to organize study materials.
            </p>
            <Link
              href="/admin/chapters/new"
              className="mt-4 inline-block rounded bg-navy px-5 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              Create Chapter
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}