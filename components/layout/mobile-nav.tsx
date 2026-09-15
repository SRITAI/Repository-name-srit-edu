'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logoutAction } from '@/lib/auth/actions'

type NavLink = { href: string; label: string }

export function MobileNav({
  links,
  isLoggedIn,
}: {
  links: NavLink[]
  isLoggedIn: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="flex flex-col gap-1.5 p-2"
      >
        <span
          className={`block h-0.5 w-6 bg-navy-900 transition ${open ? 'translate-y-2 rotate-45' : ''}`}
        />
        <span className={`block h-0.5 w-6 bg-navy-900 transition ${open ? 'opacity-0' : ''}`} />
        <span
          className={`block h-0.5 w-6 bg-navy-900 transition ${open ? '-translate-y-2 -rotate-45' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-20 border-b border-neutral-100 bg-white px-4 py-4 shadow-md">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded px-2 py-2.5 text-sm font-medium text-navy-700 hover:bg-neutral-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex flex-col gap-2 border-t border-neutral-100 pt-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded px-2 py-2.5 text-sm font-medium text-navy-700 hover:bg-neutral-50"
                >
                  Dashboard
                </Link>
                <form action={logoutAction}>
                  <button className="w-full rounded bg-navy px-4 py-2.5 text-sm font-medium text-white">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded px-2 py-2.5 text-center text-sm font-medium text-navy-700 hover:bg-neutral-50"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded bg-navy px-4 py-2.5 text-center text-sm font-medium text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
