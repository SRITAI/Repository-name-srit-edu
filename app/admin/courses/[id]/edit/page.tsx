import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateCourseAction } from '../../actions'

export default async function EditCoursePage({
  params,
}: {
  params: { id: string }
}) {
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

  const { data: course, error } = await (supabase as any)
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !course) {
    redirect('/admin/courses')
  }

  const languages = course.languages ?? ['en']
  const languageValue =
    languages.includes('en') && languages.includes('hi')
      ? 'en-hi'
      : languages[0] ?? 'en'

  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <div className="container max-w-3xl">
        <Link
          href="/admin/courses"
          className="mb-5 inline-block text-sm text-blue-600 hover:underline"
        >
          ← Back to Courses
        </Link>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-navy-900">
            Edit Course
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Update course information and publishing settings.
          </p>

          <form action={updateCourseAction} className="mt-6 space-y-5">
            <input type="hidden" name="id" value={course.id} />

            <div>
              <label className="text-sm font-medium">Course Title</label>
              <input
                name="title"
                defaultValue={course.title}
                required
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                name="category"
                defaultValue={course.category}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
              >
                <option value="pcm">PCM</option>
                <option value="pcb">PCB</option>
                <option value="question_papers">Question Papers</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                defaultValue={course.description ?? ''}
                rows={5}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Languages</label>
              <select
                name="languages"
                defaultValue={languageValue}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="en-hi">Hindi + English</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">
                  Price (₹)
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={(course.price_paise ?? 0) / 100}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Original Price (₹)
                </label>
                <input
                  name="original_price"
                  type="number"
                  min="0"
                  defaultValue={
                    (course.original_price_paise ?? 0) / 100
                  }
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Paper Analysis Years
              </label>
              <input
                name="paper_analysis_years"
                type="number"
                min="1"
                max="20"
                defaultValue={course.paper_analysis_years ?? 5}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
              />
            </div>

            <div className="space-y-3 rounded-lg bg-neutral-50 p-4">
              <label className="flex items-center gap-3 text-sm">
                <input
                  name="ncert_based"
                  type="checkbox"
                  defaultChecked={course.ncert_based}
                />
                <span>NCERT Based</span>
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input
                  name="board_focused"
                  type="checkbox"
                  defaultChecked={course.board_focused}
                />
                <span>Board Focused</span>
              </label>

              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  name="is_published"
                  type="checkbox"
                  defaultChecked={course.is_published}
                />
                <span>Publish this course</span>
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/admin/courses"
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
      </div>
    </main>
  )
}
