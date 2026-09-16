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
    <nav className="w-full space-y-1">
      {LINKS.map((link) => {
        const active = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block w-full rounded-lg px-3 py-2 text-sm font-medium ${
              active
                ? 'bg-navy text-white'
                : 'text-navy-700 hover:bg-neutral-100'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
