'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { logoutAction } from '@/lib/auth/actions'
import { SubmitButton } from '@/components/forms/submit-button'

type NavLink = { href: string; label: string; highlight?: boolean; isDashboard?: boolean }

export function MobileNav({
  links,
  isLoggedIn,
}: {
  links: NavLink[]
  isLoggedIn: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2 md:hidden">
      {isLoggedIn && (
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          aria-label="Dashboard"
          title="Dashboard"
          className="flex h-10 w-10 min-[380px]:w-auto min-[380px]:px-3 items-center justify-center gap-1.5 rounded-xl bg-navy-900 text-xs font-bold text-white shadow-xs transition hover:bg-navy-800 active:scale-95 shrink-0"
        >
          <LayoutDashboard size={16} className="shrink-0 text-white" />
          <span className="hidden min-[380px]:inline">Dashboard</span>
        </Link>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-xs transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="flex flex-col items-center justify-center gap-1.5 w-5">
          <span
            className={`block h-0.5 w-5 rounded-full bg-navy-900 transition-all duration-200 ${
              open ? 'translate-y-2 rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-navy-900 transition-all duration-200 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-navy-900 transition-all duration-200 ${
              open ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 sm:top-[70px] z-50 border-b border-slate-200/80 bg-white/95 px-5 py-5 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  (link as any).isDashboard
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold'
                    : link.highlight
                    ? 'bg-blue-50/80 text-blue-700 border border-blue-200/60'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-navy-900'
                }`}
              >
                <span>{link.label}</span>
                {(link as any).isDashboard ? (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Student Portal
                  </span>
                ) : link.highlight ? (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Program
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-blue-200/80 bg-blue-50/70 px-4 py-2.5 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  Go to Dashboard
                </Link>
                <form action={logoutAction}>
                  <SubmitButton
                    label="Log out"
                    pendingLabel="Logging out…"
                    variant="outline"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  />
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200/80 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-navy-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md transition hover:bg-navy-700"
                >
                  Sign Up
                </Link>
                <Link
                  href="/employee/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-blue-200/80 bg-blue-50/70 px-4 py-2.5 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  Employee Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
