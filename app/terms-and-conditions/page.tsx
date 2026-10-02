import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FileText,
  UserCheck,
  Smartphone,
  Copyright,
  ShieldCheck,
  CreditCard,
  GraduationCap,
  Award,
  Ban,
  AlertTriangle,
  Scale,
  Mail,
} from 'lucide-react'
import { LegalNav } from '@/components/legal/legal-nav'

export const metadata: Metadata = {
  title: 'Terms & Conditions — SRIT EDU',
  description:
    'Official Terms & Conditions for SRIT EDU. Review student account rules, course enrollments, device limits, copyright protections, and educational disclaimers.',
}

export default function TermsAndConditionsPage() {
  return (
    <div className="container max-w-4xl py-12 md:py-16">
      <LegalNav currentPath="/terms-and-conditions" />

      {/* Header Banner */}
      <div className="mb-10 rounded-2xl bg-gradient-to-br from-navy to-navy-900 p-8 text-white shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
          <FileText className="h-3.5 w-3.5" />
          Platform Terms of Service
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          SRIT EDU Terms &amp; Conditions
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
          These Terms &amp; Conditions govern your access to and use of the SRIT EDU platform, courses,
          study notes, question paper analyses, scholarship programs, and associated digital services.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/70">
          <span>Platform: <strong className="text-white font-medium">SRIT EDU (Powered by GenZ)</strong></span>
          <span>•</span>
          <span>Last Updated: <strong className="text-white font-medium">20 September 2026</strong></span>
        </div>
      </div>

      {/* Summary Box */}
      <div className="mb-10 rounded-xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-blue-900">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold text-navy-900">Important Summary for Students</p>
            <p className="mt-1 text-neutral-700 leading-relaxed">
              By creating an account or accessing SRIT EDU, you agree to these Terms. Course materials are
              proprietary and for your personal study only—sharing accounts or redistributing materials is strictly
              prohibited. Each account is limited to a maximum of 2 active devices. SRIT EDU provides educational
              guidance and past-year analyses, but does not guarantee specific marks, ranks, or examination results.
            </p>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="space-y-10 text-neutral-700 leading-relaxed">
        {/* Section 1 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Scale className="h-5 w-5 text-blue-600 flex-shrink-0" />
            1. Agreement to Terms &amp; Platform Purpose
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              SRIT EDU (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), powered by GenZ, is an online
              educational platform providing NCERT-based examination preparation for Physics, Chemistry, and
              Mathematics/Biology (PCM/PCB) students in Hindi and English, alongside previous-years&apos; board question
              paper analyses and a student scholarship program.
            </p>
            <p>
              By visiting the website, registering a student account, enrolling in a free or paid course, submitting a
              scholarship application, or viewing any course materials, you agree to be bound by these Terms &amp; Conditions,
              our <Link href="/privacy-policy" className="text-blue-600 underline hover:text-blue-700 font-medium">Privacy Policy</Link>,
              and our <Link href="/refund-policy" className="text-blue-600 underline hover:text-blue-700 font-medium">Refund Policy</Link>.
              If you do not agree to all of these terms, you must not use or access SRIT EDU.
            </p>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <strong className="text-navy-900">Independent Educational Initiative:</strong>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                SRIT EDU is an independent educational platform. SRIT EDU is <strong>NOT</strong> affiliated with,
                endorsed by, sponsored by, or authorized by the Central Board of Secondary Education (CBSE), the Uttar
                Pradesh Madhyamik Shiksha Parishad (UP Board), CISCE, or any other government examination board or authority.
                All course curricula, question frequency analyses, and study notes are developed independently for educational
                and revision assistance based on publicly accessible curriculum guidelines.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <UserCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
            2. Account Registration, Accuracy &amp; Confidentiality
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              To access courses, study notes, question papers, or apply for scholarships, students must register a verified
              account. When registering, you agree to:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Provide accurate, truthful, current, and complete personal and contact information.</li>
              <li>Maintain and promptly update your profile information if any details change.</li>
              <li>Keep your password, authentication tokens, and login credentials strictly confidential.</li>
              <li>
                Accept full responsibility for all activities, enrollments, and communications that take place under your account.
              </li>
            </ul>
            <p>
              <strong className="text-navy-900">Personal &amp; Non-Transferable License:</strong> Your SRIT EDU account
              is strictly personal. You may not sell, lease, sublicense, transfer, or share your account credentials or course
              access with any other student, family member, coaching institute, or third party.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Smartphone className="h-5 w-5 text-blue-600 flex-shrink-0" />
            3. Device &amp; Session Restrictions (Maximum 2 Active Devices)
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              To protect student accounts against unauthorized takeovers and prevent illegal account sharing:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-navy-900">Maximum Two (2) Concurrent Devices:</strong> Each student account is
                strictly limited to a maximum of two (2) active devices (e.g., one mobile phone and one laptop/tablet).
              </li>
              <li>
                <strong className="text-navy-900">Device Tracking &amp; Security Sessions:</strong> The platform creates a
                secure, encrypted device session token (<code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-navy-900">srit_device_session</code>)
                and logs device metadata (device label, browser family, IP address, last active timestamp).
              </li>
              <li>
                <strong className="text-navy-900">Session Revocation:</strong> If you reach the two-device limit and wish to
                log in from a new device, you must revoke one of your existing active sessions from your student dashboard.
              </li>
              <li>
                <strong className="text-navy-900">Circumvention Prohibited:</strong> Any attempt to circumvent device limits,
                manipulate session cookies, clone device tokens, or automate multi-user logins constitutes a material violation
                of these Terms and will result in immediate session revocation or account termination.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Copyright className="h-5 w-5 text-blue-600 flex-shrink-0" />
            4. Intellectual Property, Protected Reader &amp; Watermarking
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              All materials hosted on SRIT EDU—including NCERT chapter notes, board question paper compilations,
              exam trend analyses, model solutions, diagrams, text, user interfaces, branding, and proprietary software—are
              the exclusive intellectual property of SRIT EDU and are protected by Indian and international copyright and
              intellectual property laws.
            </p>

            <div className="space-y-3 pl-2">
              <div>
                <h3 className="font-semibold text-navy-900">A. Limited Personal License</h3>
                <p className="mt-1">
                  Upon valid enrollment, SRIT EDU grants you a limited, non-exclusive, non-transferable, revocable license
                  to view and read the educational content solely for your own personal, non-commercial examination preparation.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-navy-900">B. Protected Reader &amp; Dynamic Forensic Watermarking</h3>
                <p className="mt-1">
                  Course materials are rendered through a protected reader environment with security controls that restrict
                  unauthorized downloading, printing, copying, or extraction. Content is overlaid with dynamic, user-specific
                  forensic watermarks containing the student&apos;s verified name, mobile number, email address, user ID, and
                  access timestamp.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-navy-900">C. Strict Prohibition on Redistribution &amp; Piracy</h3>
                <p className="mt-1">
                  You agree that you will <strong>NOT</strong>:
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5">
                  <li>Copy, capture, record, rip, screenshot, scrape, or extract materials from the secure reader.</li>
                  <li>Mask, obscure, modify, or remove dynamic forensic watermarks.</li>
                  <li>
                    Distribute, upload, publish, broadcast, share, or resell SRIT EDU materials on any public or private channel,
                    including Telegram, WhatsApp, YouTube, Google Drive, Discord, torrent sites, blogs, or social media.
                  </li>
                  <li>Use SRIT EDU materials for any commercial purpose, tutoring institute, or group study distribution.</li>
                </ul>
                <p className="mt-2 text-xs text-neutral-500">
                  Infringements will be traced using embedded forensic identifiers and reported for appropriate legal action
                  under applicable copyright, information technology, and civil laws.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
            5. Course Pricing, Enrollments &amp; Payment Gateway
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              <strong className="text-navy-900">Pricing:</strong> Course prices on SRIT EDU are stated in Indian Rupees
              (INR) and are subject to change without prior notice. The fee applicable is the amount shown at checkout at
              the time of purchase.
            </p>
            <p>
              <strong className="text-navy-900">Free vs. Paid Enrollments:</strong>
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Free courses are activated immediately upon clicking &ldquo;Enroll&rdquo; in the student dashboard.</li>
              <li>
                Paid courses are activated only after the payment gateway confirms successful authorization and settlement
                of the course fee.
              </li>
            </ul>
            <p>
              <strong className="text-navy-900">Payment Security:</strong> Payments are processed through accredited payment
              gateway partners (such as Razorpay). SRIT EDU does not store sensitive card credentials, CVVs, or UPI PINs.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Scale className="h-5 w-5 text-blue-600 flex-shrink-0" />
            6. Refund Policy Reference
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>
              All transactions, cancellations, failed payments, and duplicate debits are governed strictly by our{' '}
              <Link href="/refund-policy" className="text-blue-600 underline hover:text-blue-700 font-medium">
                Refund &amp; Cancellation Policy
              </Link>.
            </p>
            <p>
              In summary: because SRIT EDU provides immediate digital access to proprietary educational materials upon
              enrollment, <strong>all course purchases are non-refundable once successful payment and course access/enrollment
              have been completed</strong>. If an order fails on the platform but funds are deducted from your bank, the funds
              are held in the banking pipeline and handled through standard banking reconciliation.
            </p>
          </div>
        </section>

        {/* Section 7 - MARKS DISCLAIMER */}
        <section id="marks-disclaimer" className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <GraduationCap className="h-5 w-5 text-blue-600 flex-shrink-0" />
            7. Marks, Results &amp; Academic Outcome Disclaimer (Very Important)
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <div className="rounded-lg border border-red-200 bg-red-50/80 p-5 text-red-950">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div className="space-y-1.5 text-sm">
                  <p className="font-bold text-red-900">NO GUARANTEE OF MARKS, RANKS, OR ACADEMIC SUCCESS</p>
                  <p className="leading-relaxed text-neutral-800">
                    SRIT EDU does <strong>NOT</strong> guarantee any particular marks, percentage, grade, rank, examination
                    result, board score, admission, selection in competitive examinations, or any other academic outcome.
                  </p>
                </div>
              </div>
            </div>

            <ul className="list-disc space-y-2.5 pl-5">
              <li>
                <strong className="text-navy-900">Educational Predictions Are Estimates Only:</strong> Any score estimate,
                marks prediction, chapter importance weighting, question frequency analysis, expected question list, or
                performance projection on SRIT EDU is strictly an educational estimate derived from retrospective analysis
                of previous years&apos; examination papers. It must NOT be treated as a guarantee, exam leak, or definitive paper.
              </li>
              <li>
                <strong className="text-navy-900">Individual Factors Govern Actual Outcomes:</strong> A student&apos;s actual
                examination results depend entirely on individual preparation, diligence, understanding of concepts, revision,
                exam-day temperament, handwriting, time management, unforeseen question paper variations by examination boards,
                and subjective examiner grading.
              </li>
              <li>
                <strong className="text-navy-900">No Promise of Guaranteed Scores:</strong> SRIT EDU explicitly disclaims any
                claims or implications of &ldquo;90+ marks guaranteed&rdquo; or similar guarantees. Students should use our
                materials as a disciplined revision and practice tool alongside official NCERT textbooks.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 8 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Award className="h-5 w-5 text-blue-600 flex-shrink-0" />
            8. Scholarship Program Rules
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>
              SRIT EDU operates a dedicated financial assistance initiative—the SRIT EDU ₹17,000 Scholarship Program.
              Participation is governed by the following rules:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Applicants must have a registered, verified SRIT EDU account.</li>
              <li>All academic details, marksheets, certificates, and income data submitted must be genuine and verifiable.</li>
              <li>
                Submission of falsified, forged, or altered documents will result in immediate application rejection,
                forfeiture of any awarded financial aid, and permanent ban from the platform.
              </li>
              <li>
                Scholarship evaluations and award decisions are conducted by the SRIT EDU verification team. All evaluation
                decisions are final.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 9 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Ban className="h-5 w-5 text-blue-600 flex-shrink-0" />
            9. Prohibited Platform Conduct &amp; Misuse
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>You agree not to engage in any of the following prohibited actions:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Sharing or lending account access or session cookies to non-registered individuals.</li>
              <li>Using automated bots, scrapers, crawlers, or extraction tools to download course contents.</li>
              <li>Decompiling, disassembling, or reverse engineering any platform software or reader mechanisms.</li>
              <li>Probing, scanning, or testing vulnerabilities of our systems, networks, or databases.</li>
              <li>Introducing malicious code, viruses, trojans, or harmful software to the platform.</li>
              <li>Submitting abusive, defamatory, threatening, or fraudulent messages through support channels.</li>
              <li>Attempting to bypass payment flows or abusing promotional coupon codes.</li>
            </ul>
          </div>
        </section>

        {/* Section 10 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Scale className="h-5 w-5 text-blue-600 flex-shrink-0" />
            10. Account Suspension, Termination &amp; Dispute Resolution
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>
              SRIT EDU reserves the right to suspend, restrict, or terminate student accounts that violate these Terms,
              infringe copyright, evade device limits, or engage in fraudulent activities.
            </p>
            <p>
              In the event of account suspension, access to purchased materials is revoked without refund. If a student
              believes an account action was taken in error, they may submit an inquiry through our{' '}
              <Link href="/contact-us" className="text-blue-600 underline hover:text-blue-700 font-medium">
                Contact Us form
              </Link>{' '}
              within 14 days of the action for review.
            </p>
          </div>
        </section>

        {/* Section 11 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Scale className="h-5 w-5 text-blue-600 flex-shrink-0" />
            11. Governing Law &amp; Jurisdiction
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>
              These Terms &amp; Conditions, and any disputes arising out of or related to your use of SRIT EDU, shall be
              governed by and construed in accordance with the laws of India.
            </p>
            <p>
              Any legal proceeding, claim, or lawsuit arising under or in connection with these Terms shall be subject to the
              exclusive jurisdiction of the competent courts situated in{' '}
              <span className="font-medium text-navy-900">[Applicable Jurisdiction / City, State, India]</span>.
            </p>
          </div>
        </section>

        {/* Section 12 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
            12. Contact Information
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              For inquiries, legal notices, or clarifications regarding these Terms &amp; Conditions, please contact us:
            </p>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 space-y-2 text-sm">
              <p>
                <strong className="text-navy-900">Online Support Form:</strong>{' '}
                <Link href="/contact-us" className="text-blue-600 underline hover:text-blue-700">
                  SRIT EDU Contact Us Form
                </Link>
              </p>
              <p>
                <strong className="text-navy-900">Official Support Email:</strong>{' '}
                <span className="font-mono text-neutral-700">[Official Support Email]</span>
              </p>
              <p>
                <strong className="text-navy-900">Official Support Phone:</strong>{' '}
                <span className="font-mono text-neutral-700">[Official Support Phone]</span>
              </p>
              <p>
                <strong className="text-navy-900">Official Registered Address:</strong>{' '}
                <span className="text-neutral-700">[Official Registered Address]</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
