import Link from 'next/link'
import { createCourse } from '../actions'
import { redirect } from 'next/navigation'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function NewCoursePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/admin/courses/new')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <div className="container max-w-3xl">
        <Link
          href="/admin/courses"
          className="mb-5 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-navy"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </Link>

        <div className="rounded-lg bg-navy p-6 text-white">
          <div className="flex items-center gap-3">
            <BookOpen size={28} />
            <div>
              <h1 className="text-2xl font-semibold">Add New Course</h1>
              <p className="text-sm text-white/70">
                Create a PCM or PCB course for SRIT EDU.
              </p>
            </div>
          </div>
        </div>

        <form action={createCourse} className="mt-6 space-y-6 rounded-lg border border-neutral-200 bg-white p-6">
          <div>
            <label className="text-sm font-medium text-neutral-700">
              Course Title
            </label>
            <input
              type="text"
              placeholder="Example: Class 12 PCM Complete Course"
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-neutral-700">
                Category
              </label>
              <select name="category" className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3">
                <option value="pcm">PCM</option>
                <option value="pcb">PCB</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">
                Languages
              </label>
              <select name="languages" className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="en-hi">Hindi + English</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">
              Description
            </label>
            <textarea name="description"
              rows={4}
              placeholder="Describe what students will learn..."
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-neutral-700">
                Course Price (₹)
              </label>
              <input
                type="number"
                name="price" placeholder="4999"
                className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">
                Original Price (₹)
              </label>
              <input
                type="number"
                name="original_price" placeholder="9999"
                className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">
              Previous Paper Analysis
            </label>
            <input
              type="number"
              name="paper_analysis_years" defaultValue={5}
              min={1}
              className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Number of previous years of board papers analyzed.
            </p>
          </div>

          <div className="space-y-3 rounded-lg bg-neutral-50 p-4">
            <label className="flex items-center gap-3 text-sm">
              <input name="ncert_based" type="checkbox" defaultChecked />
              <span>NCERT Based</span>
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input name="board_focused" type="checkbox" defaultChecked />
              <span>Board Focused</span>
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input name="is_published" type="checkbox" />
              <span>Publish course immediately</span>
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
              className="rounded-lg bg-navy px-5 py-3 text-sm font-medium text-white"
            >
              Create Course
            </button>
          </div>

          <p className="text-center text-xs text-neutral-500">
            Course saving will be connected to Supabase in the next step.
          </p>
        </form>
      </div>
    </main>
  )
}
