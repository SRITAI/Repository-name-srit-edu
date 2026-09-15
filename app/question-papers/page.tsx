import { createClient } from '@/lib/supabase/server'
import { formatPaise } from '@/lib/format'

type Paper = {
  id: string
  subject: string
  class: string
  board: string
  year: number
  language: string
  is_free: boolean
  price_paise: number | null
}

function PaperRow({ paper }: { paper: Paper }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 py-4">
      <div>
        <p className="font-medium text-navy-900">
          {paper.subject} — {paper.class}
        </p>
        <p className="text-sm text-neutral-600">
          {paper.board} • {paper.year} • {paper.language === 'hi' ? 'Hindi' : 'English'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {paper.is_free ? (
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            FREE
          </span>
        ) : (
          <span className="text-sm font-medium text-navy-900">
            {paper.price_paise ? formatPaise(paper.price_paise) : '—'}
          </span>
        )}
        <span
          title="Secure PDF delivery is a later build step"
          className="cursor-not-allowed rounded border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-400"
        >
          Coming soon
        </span>
      </div>
    </div>
  )
}

function PaperSection({ title, papers }: { title: string; papers: Paper[] }) {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-navy-900">{title}</h2>
      {papers.length ? (
        <div className="mt-2">
          {papers.map((paper: Paper) => (
            <PaperRow key={paper.id} paper={paper} />
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-neutral-600">No {title} papers published yet.</p>
      )}
    </div>
  )
}

export default async function QuestionPapersPage() {
  const supabase = createClient()
  const { data: papers } = await supabase
    .from('question_papers')
    .select('*')
    .order('year', { ascending: false })

  const paperList = (papers ?? []) as Paper[]
  const pcm = paperList.filter((p: Paper) => (p as Paper & { category?: string }).category === 'pcm')
  const pcb = paperList.filter((p: Paper) => (p as Paper & { category?: string }).category === 'pcb')

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-semibold text-navy-900">Board Exam Unsolved Question Papers</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Practice with board-focused, unsolved question papers by year and subject. Downloads open
        once secure PDF delivery is enabled in the next build step.
      </p>

      <PaperSection title="PCM" papers={pcm} />
      <PaperSection title="PCB" papers={pcb} />
    </div>
  )
}
