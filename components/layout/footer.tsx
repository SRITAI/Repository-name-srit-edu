import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-neutral-100 bg-neutral-50">
      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold text-navy-900">SRIT EDU</p>
          <p className="text-sm text-neutral-600">Powered by GenZ</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-navy-900">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/courses">Courses</Link></li>
            <li><Link href="/scholarship">Scholarship</Link></li>
            <li><Link href="/updates">Updates</Link></li>
            <li><Link href="/about-us">About</Link></li>
            <li><Link href="/contact-us">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-navy-900">Legal</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li><Link href="/legal/terms">Terms &amp; Conditions</Link></li>
            <li><Link href="/legal/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/legal/refund-policy">Refund Policy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-navy-900">Course</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li><Link href="/courses/pcm">PCM</Link></li>
            <li><Link href="/courses/pcb">PCB</Link></li>
            <li><Link href="/question-papers">Question Papers</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
