import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

function StatCard({ stat, label }: { stat: string; label: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-5">
      <p className="text-2xl font-semibold text-navy-900">{stat}</p>
      <p className="mt-1 text-sm text-neutral-600">{label}</p>
    </div>
  )
}

function PlanBlock({ time, subject }: { time: string; subject: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-5">
      <p className="text-sm font-medium text-blue-600">{time}</p>
      <p className="mt-1 font-medium text-navy-900">{subject}</p>
    </div>
  )
}

export default async function HomePage() {
  const supabase = createClient()

  const { data: updates } = await supabase
    .from('announcements')
    .select('title, publish_date')
    .eq('status', 'published')
    .order('publish_date', { ascending: false })
    .limit(1)

  const latestUpdate = updates?.[0]

  return (
    <>
      <section className="border-b border-neutral-100 bg-neutral-50">
        <div className="container grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-blue-600">
              <span className="rounded-full border border-blue-200 bg-white px-3 py-1">
                NCERT Based
              </span>
              <span className="rounded-full border border-blue-200 bg-white px-3 py-1">
                Hindi &amp; English
              </span>
              <span className="rounded-full border border-blue-200 bg-white px-3 py-1">
                Board Exam Pattern
              </span>
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-navy-900 md:text-5xl">
              Prepare Smarter. Score Higher.
            </h1>
            <p className="mt-4 text-lg text-neutral-600">
              NCERT-based PCM &amp; PCB preparation designed through deep analysis of the last 5
              years of Board Examination question papers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="rounded bg-navy px-6 py-3 text-sm font-medium text-white hover:bg-blue-600"
              >
                Explore Courses
              </Link>
              <Link
                href="/scholarship"
                className="rounded border border-navy px-6 py-3 text-sm font-medium text-navy-900 hover:bg-white"
              >
                Apply for Scholarship
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="font-medium text-navy-900">Your Board Preparation, Analysed.</p>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600">
              <li>Frequently asked concepts, identified from five years of papers</li>
              <li>Important chapters and repeated question patterns</li>
              <li>NCERT-aligned, board-focused preparation</li>
            </ul>
          </div>
        </div>
      </section>

      {latestUpdate && (
        <section className="container py-6">
          <Link
            href="/updates"
            className="block rounded-lg border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-navy-900 hover:border-blue-300"
          >
            <span className="font-semibold">New: </span>
            {latestUpdate.title}
          </Link>
        </section>
      )}

      <section className="container py-16">
        <h2 className="text-2xl font-semibold text-navy-900">Why SRIT EDU?</h2>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Every course is built from a close reading of the last five years of board papers —
          repeated concepts, important chapters, marks distribution, and NCERT alignment.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard stat="5 Years" label="Board Paper Analysis" />
          <StatCard stat="NCERT" label="NCERT-Based Preparation" />
          <StatCard stat="2 Languages" label="Hindi & English" />
          <StatCard stat="90+" label="Aim Higher With Consistent Preparation" />
        </div>
      </section>

      <section className="border-t border-neutral-100 bg-neutral-50 py-16">
        <div className="container">
          <h2 className="text-2xl font-semibold text-navy-900">Choose Your Preparation</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Link
              href="/courses/pcm"
              className="rounded-lg border border-neutral-200 bg-white p-6 transition hover:border-blue-500"
            >
              <h3 className="font-semibold text-navy-900">PCM</h3>
              <p className="mt-1 text-sm text-neutral-600">Physics • Chemistry • Mathematics</p>
            </Link>
            <Link
              href="/courses/pcb"
              className="rounded-lg border border-neutral-200 bg-white p-6 transition hover:border-blue-500"
            >
              <h3 className="font-semibold text-navy-900">PCB</h3>
              <p className="mt-1 text-sm text-neutral-600">Physics • Chemistry • Biology</p>
            </Link>
            <Link
              href="/question-papers"
              className="rounded-lg border border-neutral-200 bg-white p-6 transition hover:border-blue-500"
            >
              <h3 className="font-semibold text-navy-900">Unsolved Question Papers</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Practice with board-focused question papers.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-2xl font-semibold text-navy-900">
          4 Hours a Day. A Smarter Study Strategy.
        </h2>
        <p className="mt-2 max-w-2xl text-neutral-600">
          An example daily plan — actual results depend on consistency, preparation level, and
          how closely the strategy is followed.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PlanBlock time="1 hour" subject="Physics" />
          <PlanBlock time="1 hour" subject="Chemistry" />
          <PlanBlock time="1 hour" subject="Mathematics / Biology" />
          <PlanBlock time="1 hour" subject="Revision + Questions" />
        </div>
        <p className="mt-6 text-sm font-medium text-blue-600">
          Study consistently, practise intelligently, and aim for 90+.
        </p>
      </section>
    </>
  )
}
