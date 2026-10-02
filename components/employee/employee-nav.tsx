'use client'

import Image from 'next/image'
import Link from 'next/link'
import { logoutAction } from '@/lib/auth/actions'
import { SubmitButton } from '@/components/forms/submit-button'
import { LogOut, MessageCircle } from 'lucide-react'

interface EmployeeNavProps {
  fullName: string
  employeeId: string
}

export function EmployeeNav({ fullName, employeeId }: EmployeeNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="container flex h-16 sm:h-[70px] items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/employee" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-xs border border-slate-200/80">
            <Image
              src="/logo/sritedu-logo.png"
              alt="SRIT EDU Logo"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-navy-900 leading-tight">
                SRIT EDU
              </span>
              <span className="rounded-full bg-blue-50 border border-blue-200/70 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                Employee
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-slate-500 uppercase leading-tight mt-0.5">
              Student Support
            </span>
          </div>
        </Link>

        {/* User Pill & Sign out */}
        <div className="flex items-center gap-3">
          <Link href="/employee/support" className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
            <MessageCircle size={15} /> <span>Support chat</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-white font-bold text-[10px]">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-navy-900 leading-tight truncate max-w-[120px]">
                {fullName}
              </span>
              <span className="font-mono text-[10px] text-slate-500 leading-tight">
                {employeeId}
              </span>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-rose-600 transition"
              title="Sign out of Employee Portal"
            >
              <LogOut size={13} className="shrink-0" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
