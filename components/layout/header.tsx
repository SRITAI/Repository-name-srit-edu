import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/lib/auth/actions'
import { MobileNav } from './mobile-nav'

const NAV_LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/question-papers', label: 'Question Papers' },
  { href: '/scholarship', label: 'Scholarship' },
  { href: '/updates', label: 'Updates' },
  { href: '/about-us', label: 'About' },
  { href: '/contact-us', label: 'Contact' },
]

export async function SiteHeader() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="relative border-b border-neutral-100">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo/sritedu-logo.png"
            alt="SRIT EDU — Powered by GenZ"
            width={160}
            height={40}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-navy-700 hover:text-blue-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-navy-700">
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button className="rounded bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-navy-700">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <MobileNav links={NAV_LINKS} isLoggedIn={!!user} />
      </div>
    </header>
  )
}
