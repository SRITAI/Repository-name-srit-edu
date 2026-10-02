'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  User,
  Smartphone,
  ShieldCheck,
} from 'lucide-react'

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/my-courses', label: 'My Courses', icon: BookOpen },
  { href: '/dashboard/orders', label: 'Order History', icon: ShoppingBag },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/devices', label: 'My Devices', icon: Smartphone },
]

interface DashboardNavProps {
  isAdmin?: boolean
}

export function DashboardNav({ isAdmin = false }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className="w-full rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
      <div className="space-y-1">
        {LINKS.map((link) => {
          const active = pathname === link.href
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </Link>
          )
        })}

        {isAdmin && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <Link
              href="/admin"
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                pathname.startsWith('/admin')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-700 bg-blue-50/60 hover:bg-blue-100/70'
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-current" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
