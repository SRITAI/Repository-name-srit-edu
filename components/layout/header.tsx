import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/lib/auth/actions'
import { SubmitButton } from '@/components/forms/submit-button'
import { MobileNav } from './mobile-nav'
import { StudentSupportChat } from '@/components/support/student-support-chat'

type HeaderNavLink = {
  href: string
  label: string
  highlight?: boolean
  isDashboard?: boolean
}

const NAV_LINKS: HeaderNavLink[] = [
  { href: '/courses', label: 'Courses' },
  { href: '/question-papers', label: 'Question Papers' },
  { href: '/scholarship', label: 'Scholarship', highlight: true },
  { href: '/updates', label: 'Updates' },
  { href: '/about-us', label: 'About' },
  { href: '/contact-us', label: 'Contact' },
]

export async function SiteHeader() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let dashboardHref = '/dashboard'
  let role: string | undefined
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role
    if (profile?.role === 'employee') {
      dashboardHref = '/employee'
    }
  }

  const navLinks = user
    ? [{ href: dashboardHref, label: 'Dashboard', isDashboard: true }, ...NAV_LINKS]
    : NAV_LINKS

  return <>
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all">
      <div className="container flex h-16 sm:h-[70px] items-center justify-between px-4 sm:px-6">
        {/* Logo & Brand Treatment */}
        <Link href="/" className="group flex items-center gap-2.5 sm:gap-3 shrink-0 transition">
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-xs border border-slate-200/80 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo/sritedu-logo.png"
              alt="SRIT EDU — Powered by GenZ"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-base sm:text-lg font-bold tracking-tight text-navy-900 leading-tight">
              SRIT EDU
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-blue-600 uppercase leading-tight mt-0.5">
              POWERED BY GENZ
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                link.isDashboard
                  ? 'bg-blue-50/90 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200/80 font-semibold'
                  : link.highlight
                  ? 'bg-blue-50/80 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200/60'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-navy-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Desktop Auth Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-navy-700 transition"
              >
                Dashboard
              </Link>
              <form action={logoutAction}>
                <SubmitButton
                  label="Log out"
                  pendingLabel="Logging out…"
                  variant="outline"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                />
              </form>
            </>
          ) : (
            <>
              <Link
                href="/employee/login"
                className="rounded-full border border-blue-200/80 bg-blue-50/70 px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition shadow-2xs"
                title="SRIT EDU Employee Portal Login"
              >
                Employee Login
              </Link>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-100/70 transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-navy-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation Toggle & Drawer */}
        <MobileNav links={navLinks} isLoggedIn={!!user} />
      </div>
    </header>
    {(!user || role === 'student') && <StudentSupportChat studentUserId={user?.id} />}
  </>
}
