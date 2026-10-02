import Link from 'next/link'

interface LegalNavProps {
  currentPath: '/privacy-policy' | '/refund-policy' | '/terms-and-conditions'
}

const LEGAL_PAGES = [
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/refund-policy', label: 'Refund Policy' },
] as const

export function LegalNav({ currentPath }: LegalNavProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-neutral-500">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-navy-900 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-neutral-400">Legal</li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-navy-900">
            {LEGAL_PAGES.find((p) => p.href === currentPath)?.label}
          </li>
        </ol>
      </nav>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4">
        {LEGAL_PAGES.map((page) => {
          const isActive = currentPath === page.href
          return (
            <Link
              key={page.href}
              href={page.href}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition active:scale-98 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-navy-900'
              }`}
            >
              {page.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
