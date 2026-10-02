import type { Metadata } from 'next'
import Link from 'next/link'
import {
  RotateCcw,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  FileX,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react'
import { LegalNav } from '@/components/legal/legal-nav'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — SRIT EDU',
  description:
    'Official Refund and Cancellation Policy for SRIT EDU. Review our non-refundable digital course policy, failed payment debit handling, and resolution procedures.',
}

export default function RefundPolicyPage() {
  return (
    <div className="container max-w-4xl py-12 md:py-16">
      <LegalNav currentPath="/refund-policy" />

      {/* Header Banner */}
      <div className="mb-10 rounded-2xl bg-gradient-to-br from-navy to-navy-900 p-8 text-white shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
          <RotateCcw className="h-3.5 w-3.5" />
          Financial &amp; Billing Terms
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          SRIT EDU Refund &amp; Cancellation Policy
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
          This policy outlines the financial terms governing course enrollments, digital content access,
          failed payment reconciliation, and technical transaction inquiries on SRIT EDU.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/70">
          <span>Platform: <strong className="text-white font-medium">SRIT EDU (Powered by GenZ)</strong></span>
          <span>•</span>
          <span>Last Updated: <strong className="text-white font-medium">20 September 2026</strong></span>
        </div>
      </div>

      {/* Summary Box */}
      <div className="mb-10 rounded-xl border border-amber-200 bg-amber-50/70 p-5 text-sm text-amber-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
          <div>
            <p className="font-semibold text-amber-900">Key Policy Summary for Students</p>
            <p className="mt-1 text-neutral-700 leading-relaxed">
              Because SRIT EDU delivers immediate digital access to proprietary educational materials upon
              enrollment, <strong>all course purchases are non-refundable once payment is completed and course access has been granted</strong>.
              If an order fails during checkout but money is debited from your bank account, the funds are held by the banking
              system and are refunded in accordance with your bank and payment gateway&apos;s standard settlement cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="space-y-10 text-neutral-700 leading-relaxed">
        {/* Section 1 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <FileX className="h-5 w-5 text-blue-600 flex-shrink-0" />
            1. Digital Content &amp; Non-Refundable Course Purchases
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              SRIT EDU is an online educational platform offering digital course preparation (including NCERT-based
              Physics, Chemistry, and Mathematics/Biology courses, chapter-wise analysis, curated notes, and board
              question paper analyses).
            </p>
            <p>
              When a student purchases a paid course on SRIT EDU, the educational content, protected study guides,
              and question papers are provisioned immediately and made accessible to the student&apos;s account.
            </p>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <strong className="text-navy-900">Non-Refundable Policy Statement:</strong>
              <p className="mt-1 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                Course purchases are strictly <strong>NON-REFUNDABLE</strong> once successful payment and course
                access/enrollment have been completed. Because digital materials cannot be &ldquo;returned&rdquo; once
                viewed or unlocked, no refunds, cancellations, chargebacks, or credit adjustments will be granted after
                access has been provisioned.
              </p>
            </div>
            <p>
              This policy applies regardless of student schedule changes, personal circumstances, technical device
              limitations of the student, accidental course selection, or subjective opinions on course difficulty.
              We encourage all students to review the course syllabus, free sample question papers, and course details
              thoroughly before completing enrollment.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
            2. Free Courses &amp; Complimentary Resources
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>
              SRIT EDU provides select free courses, sample board question papers, and educational updates at zero cost.
            </p>
            <p>
              Free courses and complimentary resources carry zero financial consideration. As no payment is made by the
              student, no refund, monetary compensation, or financial claims can arise from free enrollments or
              complimentary materials under any circumstance.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
            3. Failed or Unsuccessful Transactions (Amount Debited from Bank)
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              During online checkout, network interruptions, payment gateway connection dropouts, or bank server
              delays may cause an order to be marked as <strong>FAILED</strong> or <strong>UNSUCCESSFUL</strong> on SRIT EDU,
              even though the money was debited from your bank account, credit card, debit card, or UPI app.
            </p>

            <div className="space-y-3 pl-2">
              <div>
                <h3 className="font-semibold text-navy-900">A. Where Deducted Funds Are Held</h3>
                <p className="mt-1">
                  In a failed transaction, the debited amount does <strong>not</strong> reach SRIT EDU&apos;s merchant account.
                  Instead, the funds remain in the inter-bank or payment gateway pipeline between your issuing bank,
                  the payment network (NPCI, Visa, Mastercard, RuPay), and the payment gateway (such as Cashfree).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-navy-900">B. Standard Banking Reversal Process</h3>
                <p className="mt-1">
                  Such debited amounts are reconciled through standard banking automation. The payment gateway and
                  your issuing bank will automatically settle or reverse the deducted amount back to the original
                  source payment instrument (your bank account, card, or UPI wallet).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-navy-900">C. What to Do If Your Account Was Debited</h3>
                <p className="mt-1">
                  If an order shows as failed on SRIT EDU but money was debited from your bank account:
                </p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5">
                  <li>Allow standard banking reconciliation to take place with your bank.</li>
                  <li>
                    If course access is not provisioned or funds are not reversed automatically, contact our support team
                    via our <Link href="/contact-us" className="text-blue-600 underline hover:text-blue-700 font-medium">Contact Us page</Link> or{' '}
                    <span className="font-mono text-neutral-700">srit123@outlook.in</span>.
                  </li>
                  <li>
                    Please provide the following transaction details to expedite investigation:
                    <ul className="mt-1.5 list-disc space-y-1 pl-5">
                      <li>Your registered student full name, email, and mobile number</li>
                      <li>Name of the course you attempted to purchase</li>
                      <li>Payment Gateway Order ID or Payment ID (e.g., Cashfree Payment ID, if visible)</li>
                      <li>Bank Transaction Reference Number (UTR / RRN number from your bank statement or SMS)</li>
                      <li>Date, timestamp, and exact debited amount</li>
                      <li>Screenshot or SMS text confirming the debit (please mask any sensitive card details or PINs)</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
            4. Timeline Notice: No Instant Refund or Fixed Day Guarantee
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>
              <strong className="text-navy-900">SRIT EDU does NOT promise an instant refund or a fixed number of days for bank-side reversals.</strong>
            </p>
            <p>
              Reversal and settlement timelines are governed entirely by external financial entities: your bank,
              the payment gateway, the card network, and inter-bank clearing cycles (such as RBI and NPCI settlement
              windows in India). Different banks and payment methods (e.g., UPI vs. net banking vs. debit/credit cards)
              operate on differing reconciliation schedules.
            </p>
            <p>
              While SRIT EDU cannot alter bank processing speeds, our support team will promptly verify gateway records,
              confirm the transaction status, and provide you with official gateway settlement reference numbers to share
              with your bank branch or customer service if needed.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <RotateCcw className="h-5 w-5 text-blue-600 flex-shrink-0" />
            5. Duplicate Transactions &amp; Technical Payment Glitches
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>
              If a student is debited more than once for the same course on the same account due to a browser double-click,
              slow network connection, or payment gateway timeout:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                The student should contact support immediately with both payment references / bank transaction IDs.
              </li>
              <li>
                Our billing team will review payment records with the payment gateway partner.
              </li>
              <li>
                Once verified that duplicate charges were successfully received for a single course enrollment on the
                same account, SRIT EDU will request the payment gateway to reverse the duplicate payment back to the
                original source payment method.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 6 - MARKS DISCLAIMER */}
        <section id="marks-disclaimer" className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <GraduationCap className="h-5 w-5 text-blue-600 flex-shrink-0" />
            6. Academic Outcome &amp; Marks Disclaimer (No Results-Based Refunds)
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <div className="rounded-lg border border-red-200 bg-red-50/70 p-4 text-red-900">
              <strong className="font-semibold text-red-900">No Outcome Guarantee &amp; No Results-Based Refunds:</strong>
              <p className="mt-1 text-xs sm:text-sm text-neutral-800 leading-relaxed">
                SRIT EDU does <strong>NOT</strong> guarantee any specific marks, percentage, grade, rank, examination
                result, admission, or academic outcome. No refund requests based on academic performance, exam scores,
                or examination questions will be entertained.
              </p>
            </div>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-navy-900">Educational Estimates Only:</strong> Any score or marks estimates,
                question frequency predictions, pattern analyses, expected questions, or performance projections provided
                on the website or within course material are strictly educational estimates based on historical analysis
                of previous years&apos; board examination papers. They must never be treated as a promise, warranty, or guarantee.
              </li>
              <li>
                <strong className="text-navy-900">Individual Factors:</strong> Actual academic results depend entirely on
                individual student preparation, consistent effort, conceptual grasp, health and performance on exam day,
                unannounced changes in examination patterns by official boards, and the subjective evaluation of official examiners.
              </li>
              <li>
                No marketing claim or promotional statement shall ever be construed as a guarantee of academic success
                or a basis for a course fee refund.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 7 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <ShieldAlert className="h-5 w-5 text-blue-600 flex-shrink-0" />
            7. Account Suspension &amp; Terms Violations
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
            <p>
              If a student account is suspended, restricted, or terminated due to a violation of our{' '}
              <Link href="/terms-and-conditions" className="text-blue-600 underline hover:text-blue-700 font-medium">
                Terms &amp; Conditions
              </Link>
              —including but not limited to content scraping, sharing account credentials, attempting to circumvent our
              two-device limit, tampering with forensic watermarks, or unauthorized redistribution of course materials—the
              student permanently forfeits course access.
            </p>
            <p>
              <strong className="text-navy-900">No refunds, full or partial, will be issued for accounts terminated due to policy or copyright violations.</strong>
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold text-navy-900">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
            8. Contact Support for Billing &amp; Payment Inquiries
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
            <p>
              For all payment questions, failed transaction investigations, or duplicate payment queries, please
              contact us with your registered account details and transaction references:
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
                <span className="font-mono text-neutral-700">srit123@outlook.in</span>
              </p>
              <p>
                <strong className="text-navy-900">Official Support Phone:</strong>{' '}
                <span className="font-mono text-neutral-700">+91 7078617263</span>
              </p>
              <p>
                <strong className="text-navy-900">Official Registered Address:</strong>{' '}
                <span className="text-neutral-700">Millennium Tower, Sector 27, Gurugram, Haryana 122002</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
