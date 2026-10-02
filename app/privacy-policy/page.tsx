import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield,
  Lock,
  Smartphone,
  Eye,
  CreditCard,
  UserCheck,
  FileCheck,
  AlertCircle,
  Mail,
  HelpCircle,
} from 'lucide-react'
import { LegalNav } from '@/components/legal/legal-nav'

export const metadata: Metadata = {
  title: 'Privacy Policy — SRIT EDU',
  description:
    'Learn how SRIT EDU collects, uses, and safeguards your personal information, account credentials, device sessions, and course access data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-12 md:py-16">
      <LegalNav currentPath="/privacy-policy" />

      {/* Header Banner */}
      <div className="mb-10 rounded-2xl bg-gradient-to-br from-navy to-navy-900 p-8 text-white shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
          <Shield className="h-3.5 w-3.5" />
          Data Protection &amp; Privacy
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          SRIT EDU Privacy Policy
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
          This Privacy Policy explains how SRIT EDU collects, uses, stores, and protects your personal
          information, authentication credentials, and learning records when you use our website,
          enroll in courses, apply for scholarships, or interact with our platform.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/70">
          <span>Platform: <strong className="text-white font-medium">SRIT EDU (Powered by GenZ)</strong></span>
          <span>•</span>
          <span>Last Updated: <strong className="text-white font-medium">20 September 2026</strong></span>
        </div>
      </div>

      {/* Quick Summary Notice */}
      <div className="mb-10 rounded-xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-blue-900">
        <div className="flex items-start gap-3">
          <Eye className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold text-navy-900">Privacy at a Glance for Students</p>
            <p className="mt-1 text-neutral-700 leading-relaxed">
              We collect only the essential personal and technical details necessary to deliver your courses,
              verify scholarship applications, protect account access, and safeguard proprietary educational
              content. We never sell your personal data to marketing brokers or third parties, and we do not
              store debit card, credit card, or UPI PIN credentials on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-10 text-neutral-700 leading-relaxed">
        {/* Section 1 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <UserCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
            1. Information We Collect
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              We collect personal and technical information when you register an account, enroll in free or
              paid courses, submit a scholarship application, communicate with our team, or navigate the
              SRIT EDU website. This includes:
            </p>

            <div className="space-y-3 pl-2">
              <div>
                <h3 className="font-semibold text-navy-900">A. Account Registration &amp; Student Profile Data</h3>
                <p className="mt-1">
                  When you create a student account, we collect your full name, mobile phone number, email
                  address, and an encrypted hash of your chosen password. If you update your profile, we store
                  the revised information.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-navy-900">B. Course Enrollment &amp; Order History</h3>
                <p className="mt-1">
                  We maintain records of courses you enroll in (e.g., PCM, PCB, question papers), enrollment
                  status, order references, course completion milestones, and access timestamps.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-navy-900">C. Scholarship Application Details (Voluntarily Submitted)</h3>
                <p className="mt-1">
                  If you apply for the SRIT EDU ₹17,000 Scholarship Program, we collect information you submit
                  to evaluate your eligibility, including academic stream, past marks or grades, school or college
                  name, roll number / student identification, category or family income information, and uploaded
                  verification documents (such as marksheets or student identity cards).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-navy-900">D. Inquiries &amp; Customer Support Communications</h3>
                <p className="mt-1">
                  When you submit a message through our <Link href="/contact-us" className="text-blue-600 underline hover:text-blue-700 font-medium">Contact Us form</Link> or
                  email our support team, we record your name, mobile number, email address, message body, and any
                  subsequent correspondence needed to resolve your query.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Smartphone className="h-5 w-5 text-blue-600 flex-shrink-0" />
            2. Authentication, Session &amp; Device Security Controls
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              To protect student accounts against unauthorized access, credential stuffing, and illicit account
              sharing, SRIT EDU maintains automated security controls and device session telemetry:
            </p>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-navy-900">Device Telemetry:</strong> When you log in, our system records your
                approximate device label (e.g., Android, Windows, macOS, iOS), browser family, user-agent string,
                IP address, and login timestamps.
              </li>
              <li>
                <strong className="text-navy-900">Maximum Two (2) Active Devices:</strong> SRIT EDU enforces a strict
                limit of a maximum of two (2) concurrent active device sessions per student account. Device session
                tokens are securely stored in encrypted, HttpOnly session cookies (<code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-navy-900">srit_device_session</code>).
              </li>
              <li>
                <strong className="text-navy-900">Session Management:</strong> Students can review active devices and
                revoke unrecognized or old device sessions at any time directly through the device management section
                in their student dashboard.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Lock className="h-5 w-5 text-blue-600 flex-shrink-0" />
            3. Private Course Materials &amp; Viewer Security Logs
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              SRIT EDU study materials, NCERT analyses, notes, and question papers are proprietary educational
              assets. To protect these materials against illegal distribution, scraping, and unauthorized reproduction:
            </p>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-navy-900">Dynamic Forensic Watermarking:</strong> In our protected document reader,
                content is dynamically watermarked with the student&apos;s verified name, registered mobile number, email
                address, student user ID, and access timestamp.
              </li>
              <li>
                <strong className="text-navy-900">Reader Access Logs:</strong> We log document access timestamps and viewing
                events. These logs are maintained exclusively for technical audit trails, verifying student engagement,
                and investigating intellectual property infringements.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
            4. Payment Information &amp; Third-Party Processing
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              Course fee transactions on SRIT EDU are processed securely through certified third-party payment gateway
              partners (such as Razorpay).
            </p>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="font-medium text-navy-900">Payment Security Notice:</p>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                SRIT EDU does <strong>NOT</strong> collect, process, or store sensitive financial credentials—such as
                credit card numbers, debit card numbers, card expiry dates, CVVs, net-banking passwords, or UPI PINs—on
                our servers. Payment entry, verification, and transaction processing are handled directly by the third-party payment gateway.
              </p>
            </div>
            <p>
              SRIT EDU receives only non-sensitive transaction confirmation metadata, including: payment status
              (success, failed, or pending), payment gateway transaction ID (e.g., Razorpay Payment ID), order ID,
              course identifier, amount paid, and transaction timestamp.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <FileCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
            5. How We Use Your Information
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>We use the information we collect for the following specific purposes:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-navy-900">Account Provisioning &amp; Authentication:</strong> To authenticate your
                identity, maintain your session, and provide secure access to your enrolled courses and dashboard.
              </li>
              <li>
                <strong className="text-navy-900">Course Delivery:</strong> To unlock purchased or enrolled course
                materials, study notes, question papers, and educational updates.
              </li>
              <li>
                <strong className="text-navy-900">Scholarship Processing:</strong> To review, verify, and determine
                eligibility for the SRIT EDU Scholarship Program.
              </li>
              <li>
                <strong className="text-navy-900">Security &amp; Abuse Prevention:</strong> To enforce device concurrency
                limits (maximum 2 active devices), detect suspicious login behavior, protect against account takeovers,
                and prevent unauthorized copying or redistribution of course assets.
              </li>
              <li>
                <strong className="text-navy-900">Customer Support:</strong> To troubleshoot payment issues, investigate
                failed transaction debits, answer curriculum questions, and resolve support tickets.
              </li>
              <li>
                <strong className="text-navy-900">Service Improvement:</strong> To monitor platform reliability, repair
                bugs, and improve the user experience for students across desktop and mobile devices.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
            6. Information Sharing &amp; Disclosure
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              <strong className="text-navy-900">We do not sell, rent, or trade your personal information.</strong> We
              do not disclose your personal information to third parties except under the following strict circumstances:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-navy-900">Service Providers:</strong> We work with trusted infrastructure
                partners (such as database hosting, secure cloud servers, and payment gateways) who process information
                on our behalf under strict confidentiality and security commitments.
              </li>
              <li>
                <strong className="text-navy-900">Legal Compliance:</strong> We may disclose information if required to
                do so by applicable Indian law, judicial summons, governmental request, or court order.
              </li>
              <li>
                <strong className="text-navy-900">Protection of Rights &amp; Safety:</strong> We may disclose information
                when necessary to investigate violations of our Terms &amp; Conditions, protect the security of our platform,
                prevent intellectual property theft, or safeguard the rights and safety of SRIT EDU, our students, or the public.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 7 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Lock className="h-5 w-5 text-blue-600 flex-shrink-0" />
            7. Data Security Practices &amp; Limitations
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              We implement reasonable administrative, technical, and physical safeguards designed to protect personal
              information against accidental loss, unauthorized access, alteration, and disclosure. These measures
              include TLS/SSL encryption for data in transit, cryptographic password hashing, role-based database
              access controls, and session token hashing.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-amber-900 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
                <div>
                  <strong className="font-semibold text-amber-900">Important Security Notice:</strong> While we employ
                  diligent, industry-standard security safeguards, no method of transmission over the internet or method
                  of electronic data storage can be guaranteed to be 100% secure. Therefore, while we strive to protect
                  your personal data, we cannot guarantee absolute security. Students are responsible for maintaining
                  a strong, unique password and safeguarding their login credentials.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <UserCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
            8. Student Rights &amp; Choices
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>As a student using SRIT EDU, you have the right to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Review your account profile information and course enrollments in the student dashboard.</li>
              <li>Inspect active login sessions and terminate unrecognized sessions from the device management tab.</li>
              <li>Request correction of inaccurate personal details by contacting our support team.</li>
              <li>Request clarification regarding how your data is handled or processed.</li>
            </ul>
          </div>
        </section>

        {/* Section 9 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            9. Changes to this Privacy Policy
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>
              SRIT EDU reserves the right to update or modify this Privacy Policy at any time to reflect updates in
              our platform features, security architecture, or legal requirements. When updates occur, we will revise
              the &ldquo;Last Updated&rdquo; date at the top of this page. Your continued use of SRIT EDU following the
              posting of revisions signifies your acknowledgment and acceptance of the modified policy.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
            10. Contact Us &amp; Privacy Queries
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data handling practices,
              please reach out through any of our official channels:
            </p>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 space-y-2 text-sm">
              <p>
                <strong className="text-navy-900">Online Support Form:</strong>{' '}
                <Link href="/contact-us" className="text-blue-600 underline hover:text-blue-700">
                  SRIT EDU Contact Page
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
