import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Hind } from 'next/font/google'
import './globals.css'
import { NavigationProgress } from '@/components/layout/navigation-progress'
import { SiteHeader } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/footer'
import { AnimatedGradientBackground } from '@/components/layout/animated-gradient-background'

// Latin + Devanagari in one family, so English and Hindi content
// share the same typographic voice across the site.
const hind = Hind({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
})

export const metadata: Metadata = {
  title: 'SRIT EDU — Powered by GenZ',
  description:
    'NCERT-based PCM & PCB preparation designed through deep analysis of the last 5 years of Board Examination question papers. Available in Hindi & English.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={hind.variable}>
      <body className="min-h-screen bg-white text-navy-900 antialiased relative">
        <AnimatedGradientBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}
