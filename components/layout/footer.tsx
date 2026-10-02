import Image from 'next/image'
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="mt-28 border-t border-slate-200/80 bg-slate-50/70 backdrop-blur-md">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-slate-200/80">
                <Image
                  src="/logo/sritedu-logo.png"
                  alt="SRIT EDU Logo"
                  width={44}
                  height={44}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-navy-900 leading-tight">
                  SRIT EDU
                </span>
                <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                  POWERED BY GENZ
                </span>
              </div>
            </Link>
            <p className="max-w-sm text-sm text-slate-600 leading-relaxed">
              Complete Learning. One Platform. Dedicated board exam preparation for Class 10 &amp; 12 students across CBSE, UP Board, and NCERT curriculum.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">Class 10</span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">Class 12</span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">CBSE</span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">UP Board</span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">NCERT</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-navy-900 tracking-tight">Quick Links</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li><Link href="/" className="hover:text-blue-600 transition">Home</Link></li>
              <li><Link href="/courses" className="hover:text-blue-600 transition">Courses</Link></li>
              <li><Link href="/scholarship" className="hover:text-blue-600 transition font-medium text-blue-600">Scholarship Program</Link></li>
              <li><Link href="/updates" className="hover:text-blue-600 transition">Updates &amp; Notices</Link></li>
              <li><Link href="/about-us" className="hover:text-blue-600 transition">About SRIT EDU</Link></li>
              <li><Link href="/contact-us" className="hover:text-blue-600 transition">Contact Support</Link></li>
              <li><Link href="/employee/login" className="hover:text-blue-600 transition font-medium text-slate-700">Employee Portal</Link></li>
            </ul>
          </div>

          {/* Academic Courses */}
          <div>
            <h3 className="text-sm font-bold text-navy-900 tracking-tight">Academics</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li><Link href="/courses/pcm" className="hover:text-blue-600 transition">PCM Preparation</Link></li>
              <li><Link href="/courses/pcb" className="hover:text-blue-600 transition">PCB Preparation</Link></li>
              <li><Link href="/question-papers" className="hover:text-blue-600 transition">Question Papers</Link></li>
              <li><Link href="/#study-resources" className="hover:text-blue-600 transition">Study Material</Link></li>
              <li><Link href="/#study-strategy" className="hover:text-blue-600 transition">Study Strategy</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold text-navy-900 tracking-tight">Legal &amp; Policies</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li><Link href="/terms-and-conditions" className="hover:text-blue-600 transition">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-blue-600 transition">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-blue-600 transition">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} SRIT EDU. All rights reserved.</p>
          <p className="font-medium text-slate-600">
            Powered by <span className="font-bold text-navy-900">GENZ</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
