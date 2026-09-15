import type { Metadata } from 'next'
import { Hind } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/footer'

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
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
