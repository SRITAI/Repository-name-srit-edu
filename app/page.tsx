import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  FileText,
  Layers,
  ShieldCheck,
  Clock,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  Languages,
  Check,
  HelpCircle,
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CourseCard } from '@/components/course/course-card'

export default async function HomePage() {
  const supabase = createClient()

  // Fetch real published courses and latest published update without modifying schema
  const [{ data: updates }, { data: courses }] = await Promise.all([
    supabase
      .from('announcements')
      .select('title, publish_date')
      .eq('status', 'published')
      .order('publish_date', { ascending: false })
      .limit(1),
    supabase
      .from('courses')
      .select('*, course_subjects(id, name)')
      .eq('is_published', true)
      .order('created_at'),
  ])

  const latestUpdate = updates?.[0]
  const courseList = courses ?? []

  return (
    <div className="relative overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. ANNOUNCEMENT BANNER (if active)
      ───────────────────────────────────────────────────────────── */}
      {latestUpdate && (
        <div className="border-b border-blue-100 bg-blue-50/70 px-4 py-2.5 backdrop-blur-sm">
          <div className="container flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Notice
              </span>
              <span className="truncate font-medium text-navy-900">
                {latestUpdate.title}
              </span>
            </div>
            <Link
              href="/updates"
              className="ml-4 shrink-0 font-semibold text-blue-600 hover:text-blue-800"
            >
              Read updates →
            </Link>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="container grid items-center gap-12 lg:grid-cols-12">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-3.5 py-1.5 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                SRIT EDU • POWERED BY GENZ
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy-900 leading-[1.12]">
              Complete Learning. <br />
              <span className="text-blue-600">Built for Your Board.</span>
            </h1>

            {/* Supporting Text */}
            <p className="max-w-2xl text-lg text-slate-600 leading-relaxed sm:text-xl">
              Learn smarter with NCERT-based study material, model papers, question papers,
              important questions and complete learning guides for Class 10 &amp; 12.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-navy-900/15 transition-all hover:bg-navy-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Courses</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#study-resources"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-6 py-3.5 text-base font-semibold text-navy-900 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
              >
                <span>View Study Material</span>
              </Link>
            </div>

            {/* Hero Quick Proof Pills */}
            <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>NCERT Aligned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>CBSE &amp; UP Board</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Hindi &amp; English Medium</span>
              </div>
            </div>
          </div>

          {/* Right Floating Education Dashboard / Cards Composition */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto max-w-[460px]">
              {/* Central Main Glass Card */}
              <div className="glass-panel relative z-10 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-500/10 border border-white/80">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/60 font-bold">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-navy-900 leading-tight">
                        SRIT EDU Platform
                      </h4>
                      <p className="text-xs font-medium text-slate-500">
                        Complete Learning. One Platform.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>

                {/* Dashboard Metrics / Features Preview */}
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-slate-100 bg-white/70 p-3.5 transition">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-navy-900">Board Syllabus Coverage</span>
                      <span className="font-bold text-blue-600">100% NCERT</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="rounded-2xl border border-slate-100 bg-white/70 p-3">
                      <span className="text-[11px] text-slate-500">Supported Classes</span>
                      <p className="mt-0.5 text-sm font-bold text-navy-900">Class 10 &amp; 12</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white/70 p-3">
                      <span className="text-[11px] text-slate-500">Supported Boards</span>
                      <p className="mt-0.5 text-sm font-bold text-navy-900">CBSE • UP Board</p>
                    </div>
                  </div>
                </div>

                {/* Live Curriculum Tags */}
                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    Physics
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    Chemistry
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    Mathematics
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    Biology
                  </span>
                </div>
              </div>

              {/* Floating Card 1: Class 10 & 12 (Top Left) */}
              <div className="animate-float-1 absolute -top-6 -left-4 sm:-left-8 z-20 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-900 leading-tight">Class 10 &amp; 12</p>
                  <p className="text-[11px] font-medium text-slate-500">NCERT Curriculum</p>
                </div>
              </div>

              {/* Floating Card 2: CBSE & UP Board (Bottom Right) */}
              <div className="animate-float-2 absolute -bottom-6 -right-3 sm:-right-6 z-20 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-900 leading-tight">CBSE &amp; UP Board</p>
                  <p className="text-[11px] font-medium text-emerald-600 font-semibold">5-Yr Paper Analysis</p>
                </div>
              </div>

              {/* Floating Card 3: Model & Question Papers (Bottom Left) */}
              <div className="animate-float-3 absolute bottom-8 -left-3 sm:-left-6 z-20 hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-900 leading-tight">Model Papers</p>
                  <p className="text-[11px] font-medium text-slate-500">Exam-Focused Practice</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. HIGH-VISIBILITY SCHOLARSHIP SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="container py-6">
        <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-navy-900 via-navy-900 to-blue-950 p-8 text-white shadow-xl sm:p-10 md:p-12">
          {/* Subtle glowing orb in card */}
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 border border-blue-400/30">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
                Financial Aid Initiative
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                SRIT EDU Scholarship Program
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Get support for your education. Dedicated financial assistance of up to{' '}
                <span className="font-bold text-white underline decoration-blue-400 underline-offset-4">
                  ₹17,000
                </span>{' '}
                for ambitious board examination students. Submit your verified academic details to be considered.
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-blue-400" /> Open for Class 10 &amp; 12
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-blue-400" /> Transparent Review
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-blue-400" /> Dashboard Tracking
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/scholarship"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-navy-900 shadow-md transition hover:bg-slate-100 hover:shadow-lg active:scale-95"
              >
                <span>Apply for Scholarship</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. BOARD & CLASS SECTION ("Choose Your Board", "Choose Your Class")
      ───────────────────────────────────────────────────────────── */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Targeted Curriculum
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy-900">
            Choose Your Board &amp; Class
          </h2>
          <p className="text-base text-slate-600">
            Preparation tailored to the exact pattern, syllabus weightage, and marking criteria of your educational board.
          </p>
        </div>

        {/* Board Cards */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            Choose Your Board
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {/* CBSE */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/8 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700 font-bold border border-blue-100">
                  CBSE
                </span>
                <span className="text-xs font-semibold text-slate-400">National Board</span>
              </div>
              <h4 className="mt-4 text-xl font-bold text-navy-900 group-hover:text-blue-600 transition">
                Central Board of Secondary Education
              </h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Full syllabus coverage structured strictly around NCERT textbooks and latest CBSE specimen question patterns.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                <span>Hindi &amp; English Medium</span>
                <Link href="/courses" className="font-semibold text-blue-600 hover:underline">
                  View Courses →
                </Link>
              </div>
            </div>

            {/* UP Board */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/8 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-purple-50 p-2.5 text-purple-700 font-bold border border-purple-100">
                  UP Board
                </span>
                <span className="text-xs font-semibold text-slate-400">State Board</span>
              </div>
              <h4 className="mt-4 text-xl font-bold text-navy-900 group-hover:text-blue-600 transition">
                Uttar Pradesh Madhyamik Shiksha Parishad
              </h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Comprehensive chapter notes, previous years&apos; question papers, and high-frequency model sets aligned with UPMSP.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                <span>Specialized State Coverage</span>
                <Link href="/courses" className="font-semibold text-blue-600 hover:underline">
                  View Courses →
                </Link>
              </div>
            </div>

            {/* NCERT */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/8 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700 font-bold border border-emerald-100">
                  NCERT
                </span>
                <span className="text-xs font-semibold text-slate-400">Core Foundation</span>
              </div>
              <h4 className="mt-4 text-xl font-bold text-navy-900 group-hover:text-blue-600 transition">
                NCERT-Based Curriculum
              </h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Rigorous line-by-line concept breakdown, exemplary problems, diagrams, and fundamental derivations.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                <span>Concepts &amp; Exemplars</span>
                <Link href="/courses" className="font-semibold text-blue-600 hover:underline">
                  View Courses →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Class Cards */}
        <div className="mt-12">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            Choose Your Class
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Class 10 */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-bold text-lg">
                    10
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-navy-900">Class 10th Preparation</h4>
                    <p className="text-xs text-slate-500">Secondary School Examination</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Board Year
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Build an unshakeable foundation across Science, Mathematics, and core board subjects with structured notes and unsolved question papers.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200/60">
                    Science
                  </span>
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200/60">
                    Mathematics
                  </span>
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200/60">
                    Model Papers
                  </span>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Explore Class 10 <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Class 12 */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-lg">
                    12
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-navy-900">Class 12th Preparation</h4>
                    <p className="text-xs text-slate-500">Senior Secondary Examination</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  PCM &amp; PCB
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                In-depth PCM (Physics, Chemistry, Maths) and PCB (Physics, Chemistry, Biology) preparation engineered from 5 years of board exam analysis.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200/60">
                    Physics
                  </span>
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200/60">
                    Chemistry
                  </span>
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200/60">
                    Maths / Biology
                  </span>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Explore Class 12 <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. SUBJECT SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="container py-20 border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Subject Discovery
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy-900">
            Master Every Core Subject
          </h2>
          <p className="text-base text-slate-600">
            Structured study tracks covering theory, formulas, derivations, and board-level problem solving.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Physics */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Atom className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">Physics</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Mechanics, Optics, Electromagnetism &amp; Modern Physics with derivation steps and numerical worksheets.
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600">
              <span>NCERT Chapters &amp; Notes</span>
              <Link href="/courses/pcm" className="hover:underline">Browse →</Link>
            </div>
          </div>

          {/* Chemistry */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FlaskConical className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">Chemistry</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Physical Chemistry calculations, Inorganic trends &amp; Organic reaction mechanisms with named reactions.
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600">
              <span>Reaction Maps &amp; Tests</span>
              <Link href="/courses" className="hover:underline">Browse →</Link>
            </div>
          </div>

          {/* Mathematics */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Calculator className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">Mathematics</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Calculus, Vectors, Probability &amp; Algebra. Step-by-step solutions to frequent board question formats.
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600">
              <span>Formulas &amp; Derivations</span>
              <Link href="/courses/pcm" className="hover:underline">Browse →</Link>
            </div>
          </div>

          {/* Biology */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Dna className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">Biology</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Genetics, Ecology, Human Physiology &amp; Botany with high-resolution labelled diagrams and key terminology.
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600">
              <span>Diagrams &amp; Definitions</span>
              <Link href="/courses/pcb" className="hover:underline">Browse →</Link>
            </div>
          </div>

          {/* English */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Languages className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">English</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Literature chapter summaries, character sketches, reading comprehension strategies, and formal writing formats.
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600">
              <span>Summaries &amp; Formats</span>
              <Link href="/question-papers" className="hover:underline">Browse →</Link>
            </div>
          </div>

          {/* Hindi */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">Hindi</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Gadya, Padya, Vyakaran, and board model answers formatted for precise marks in state and central examinations.
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600">
              <span>Vyakaran &amp; Sahitya</span>
              <Link href="/question-papers" className="hover:underline">Browse →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. STUDY RESOURCES SECTION ("Everything You Need to Prepare")
      ───────────────────────────────────────────────────────────── */}
      <section id="study-resources" className="container py-20 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Resource Library
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy-900">
            Everything You Need to Prepare
          </h2>
          <p className="text-base text-slate-600">
            Comprehensive tools and materials designed to turn your study hours into high exam performance.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Full Learning Guide */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">1. Full Learning Guide</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Complete syllabus roadmaps with structured progression across chapters, formulas, and concepts.
            </p>
            <Link href="/courses" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
              Explore Guide →
            </Link>
          </div>

          {/* 2. NCERT Study Material */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">2. NCERT Study Material</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Core textbook breakdown, in-text questions, back exercises, and exemplary problem resolutions.
            </p>
            <Link href="/courses" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
              View Material →
            </Link>
          </div>

          {/* 3. Model Papers */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">3. Model Papers</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Curated board-pattern sample papers designed to test real-time exam timing, speed, and accuracy.
            </p>
            <Link href="/question-papers" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
              Practice Papers →
            </Link>
          </div>

          {/* 4. Previous Question Papers */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">4. Previous Question Papers</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              5-year board examination question archives categorized by subject, year, and language medium.
            </p>
            <Link href="/question-papers" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
              Browse Papers →
            </Link>
          </div>

          {/* 5. Important Questions */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">5. Important Questions</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              High-frequency recurring questions and high-yield topics compiled from repeated exam pattern trends.
            </p>
            <Link href="/courses" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
              View Questions →
            </Link>
          </div>

          {/* 6. Chapter-wise Practice */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900">6. Chapter-wise Practice</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Dedicated test drills for each chapter to verify mastery before moving ahead in the syllabus.
            </p>
            <Link href="/courses" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
              Start Practice →
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. COURSES SECTION (Dynamic Supabase Courses)
      ───────────────────────────────────────────────────────────── */}
      <section id="courses" className="container py-20 border-t border-slate-100 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Featured Programs
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-navy-900">
              Board Preparation Courses
            </h2>
            <p className="mt-1 text-base text-slate-600">
              NCERT-aligned PCM and PCB courses built directly from five years of board exam paper trends.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            View all courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {courseList.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {courseList.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-lg font-bold text-navy-900">Courses Preparing for Launch</h3>
            <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
              Our academic team is finalizing new course materials. Explore question papers or apply for scholarship in the meantime.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/question-papers"
                className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-700"
              >
                View Question Papers
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. TEACHER POSITIONING ("Learn from Expert Teachers")
      ───────────────────────────────────────────────────────────── */}
      <section className="container py-20 border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Academic Faculty
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy-900">
            Learn from Expert Teachers
          </h2>
          <p className="text-base text-slate-600">
            Curriculum-aligned guidance focused on NCERT fundamentals, board question trends, and step-by-step problem-solving.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Teacher 1: Physics */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <Atom className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-navy-900">Physics Faculty</h3>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-0.5">
              Mechanics &amp; Electrodynamics
            </p>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Specialized in conceptual clarity, derivation breakdowns, and solving high-weightage numericals.
            </p>
          </div>

          {/* Teacher 2: Chemistry */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FlaskConical className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-navy-900">Chemistry Faculty</h3>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">
              Organic &amp; Physical Chemistry
            </p>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Dedicated to reaction mechanism visualization, NCERT line-by-line coverage, and formula retention.
            </p>
          </div>

          {/* Teacher 3: Mathematics */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Calculator className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-navy-900">Mathematics Faculty</h3>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-0.5">
              Calculus &amp; Algebra
            </p>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Focused on theorem derivations, step-wise marking methods, and systematic problem practice.
            </p>
          </div>

          {/* Teacher 4: Biology */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <Dna className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-navy-900">Biology Faculty</h3>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mt-0.5">
              Genetics &amp; Physiology
            </p>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Guiding students through precise NCERT terminology, biological diagrams, and scoring structures.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. 4-HOUR STUDY STRATEGY SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="study-strategy" className="container py-20 border-t border-slate-100 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Study Routine
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy-900">
            4 Hours a Day. A Smarter Study Strategy.
          </h2>
          <p className="text-base text-slate-600">
            A disciplined daily framework designed to produce steady concept clarity and sustained board exam readiness.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              <Clock className="h-3.5 w-3.5" /> 1 Hour
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">Physics</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Focus on fundamental formulas, derivations, and resolving NCERT numerical exercises.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              <Clock className="h-3.5 w-3.5" /> 1 Hour
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">Chemistry</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Review reaction mechanisms, chemical equations, and memorizing core inorganic tables.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <Clock className="h-3.5 w-3.5" /> 1 Hour
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">Mathematics / Biology</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Work through step-by-step problem sets or biological diagram labels and definitions.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              <Clock className="h-3.5 w-3.5" /> 1 Hour
            </div>
            <h3 className="mt-4 text-xl font-bold text-navy-900">Revision + Questions</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Solve unsolved questions from past 5 years and review difficult points from the day.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FINAL CONVERSION CTA SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="container py-20 border-t border-slate-100">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 sm:p-12 text-center shadow-lg backdrop-blur-md">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-900">
            Complete Learning. One Platform.
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-base text-slate-600">
            Begin your board examination preparation with NCERT-aligned notes, model papers, and 5-year paper insights.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-navy-700 transition"
            >
              <span>Explore Courses</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/scholarship"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-sm hover:bg-slate-50 transition"
            >
              <span>Apply for Scholarship</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
