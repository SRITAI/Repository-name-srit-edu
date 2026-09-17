import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { deleteMaterial } from './actions'

type Material = {
  id: string
  file_name: string
  language: string
  sort_order: number
  created_at: string
  courses?: { id: string; title: string }
  course_subjects?: { id: string; name: string }
  course_chapters?: { id: string; title: string }
}

export default async function MaterialsListPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const { supabase } = await requireAdmin('/admin/materials')

  const params = searchParams
  const success = params.success === '1'
  const error = typeof params.error === 'string' ? params.error : ''

  const { data: materials, error: loadError } = await supabase
    .from('course_files')
    .select(
      'id, file_name, language, sort_order, created_at, courses(id, title), course_subjects(id, name), course_chapters(id, title)'
    )
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">Study Materials</h1>
            <p className="text-sm text-neutral-600">Manage protected PDFs for courses, subjects and chapters.</p>
          </div>
          <Link
            href="/admin/materials/new"
            className="rounded-lg bg-navy px-5 py-3 text-sm font-medium text-white hover:bg-blue-600"
          >
            + Add Material
          </Link>
        </div>

        {success && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 mb-4">
            Material uploaded/updated successfully.
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {loadError ? (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Unable to load study materials.
          </div>
        ) : materials && materials.length > 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="px-4 py-3 font-semibold text-navy-900">File Name</th>
                    <th className="px-4 py-3 font-semibold text-navy-900">Course</th>
                    <th className="px-4 py-3 font-semibold text-navy-900">Subject</th>
                    <th className="px-4 py-3 font-semibold text-navy-900">Chapter</th>
                    <th className="px-4 py-3 font-semibold text-navy-900">Language</th>
                    <th className="px-4 py-3 font-semibold text-navy-900">Sort Order</th>
                    <th className="px-4 py-3 font-semibold text-navy-900">Created</th>
                    <th className="px-4 py-3 font-semibold text-navy-900">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {materials.map((material: Material) => (
                    <tr key={material.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-navy-900 whitespace-nowrap">
                        {material.file_name}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {material.courses?.title || '—'}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {material.course_subjects?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {material.course_chapters?.title || '—'}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {material.language === 'hi' ? 'Hindi' : 'English'}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {material.sort_order}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {new Date(material.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <form action={deleteMaterial} className="inline-block">
                            <input type="hidden" name="id" value={material.id} />
                            <button
                              type="submit"
                              className="text-sm font-medium text-red-500 hover:text-red-600 bg-transparent border-none p-0 cursor-pointer"
                            >
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
          <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-12 text-center">
            <p className="text-neutral-600 mb-4">No study materials uploaded yet.</p>
            <Link
              href="/admin/materials/new"
              className="inline-block rounded bg-navy px-5 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              Upload your first material
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
