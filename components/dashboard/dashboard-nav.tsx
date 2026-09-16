'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/my-courses', label: 'My Courses' },
  { href: '/dashboard/orders', label: 'Order History' },
  { href: '/dashboard/profile', label: 'Profile' },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="w-full rounded-xl border border-neutral-200 bg-white p-2 shadow-sm">
      <div className="space-y-1">
        {LINKS.map((link) => {
          const active = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition ${
                active
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-navy-700 hover:bg-neutral-50 hover:text-navy-900'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
