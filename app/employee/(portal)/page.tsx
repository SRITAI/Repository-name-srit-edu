import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthenticatedEmployee } from '@/lib/employee/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ReferralIdentityCard } from '@/components/employee/referral-identity-card'
import { submitEmployeeFeedbackAction, submitEmployeeIssueAction } from '@/app/employee/actions'
import { SubmitButton } from '@/components/forms/submit-button'
import {
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Coins,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Bug,
  Building2,
  Calendar,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: {
    feedbackSuccess?: string
    feedbackError?: string
    issueSuccess?: string
    issueError?: string
  }
}

export default async function EmployeePortalPage({ searchParams }: PageProps) {
  // 1. Authoritative Server-side Authentication & Active Employee Verification
  const authResult = await getAuthenticatedEmployee()
  if (authResult.status !== 'authenticated' || !authResult.employeeProfile) {
    redirect('/employee/login?redirectTo=/employee')
  }

  const { employeeProfile } = authResult

  // 2. Authoritative Employee Name Resolution: profiles.full_name with safe fallback
  const rawName = employeeProfile.full_name?.trim()
  const fullName = rawName && rawName.length > 0 ? rawName : 'Employee'

  const supabase = createClient()
  const admin = createAdminClient()

  // 3. Authoritative Incentive Calculation (Reuses Existing Database Function Directly)
  // Invokes public.get_employee_incentive_summary(uuid) defined in migration 0007.
  // Zero duplicated incentive formulas in application code.
  const { data: incentiveSummary } = await (supabase as any).rpc('get_employee_incentive_summary', {
    p_employee_id: employeeProfile.id,
  })

  const verifiedSales: number = incentiveSummary?.verified_sales ?? 0
  const qualifiedMilestones: number = incentiveSummary?.qualified_milestones ?? 0
  const totalEarnedRupees: number = incentiveSummary?.total_earned_rupees ?? 0
  const totalPaidRupees: number = incentiveSummary?.total_paid_rupees ?? 0
  const pendingPayoutRupees: number = incentiveSummary?.pending_payout_rupees ?? 0
  const salesNeeded: number = incentiveSummary?.sales_needed_for_next_milestone ?? 2

  // 4. Fetch Employee's Own Feedback Submissions (Scoped to employeeProfile.id + Database RLS)
  const { data: rawFeedback } = await supabase
    .from('employee_feedback')
    .select('id, category, what_explored, what_liked, improvement_points, feature_suggestion, priority, screenshot_path, created_at')
    .eq('employee_id', employeeProfile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Generate short-lived signed URLs for attachments belonging to this employee
  const feedbackList = await Promise.all(
    (rawFeedback || []).map(async (item: any) => {
      let signedUrl: string | null = null
      if (item.screenshot_path && typeof item.screenshot_path === 'string' && item.screenshot_path.startsWith(`${employeeProfile.id}/`)) {
        const { data: signedData } = await admin.storage
          .from('employee-screenshots')
          .createSignedUrl(item.screenshot_path, 3600)
        signedUrl = signedData?.signedUrl || null
      }
      return { ...item, signedUrl }
    })
  )

  // 5. Fetch Employee's Own Reported Issues (Scoped to employeeProfile.id + Database RLS)
  const { data: rawIssues } = await supabase
    .from('employee_issues')
    .select('id, title, description, page_section, device_type, priority, resolution_status, screenshot_path, created_at')
    .eq('employee_id', employeeProfile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Generate short-lived signed URLs for attachments belonging to this employee
  const issueList = await Promise.all(
    (rawIssues || []).map(async (item: any) => {
      let signedUrl: string | null = null
      if (item.screenshot_path && typeof item.screenshot_path === 'string' && item.screenshot_path.startsWith(`${employeeProfile.id}/`)) {
        const { data: signedData } = await admin.storage
          .from('employee-screenshots')
          .createSignedUrl(item.screenshot_path, 3600)
        signedUrl = signedData?.signedUrl || null
      }
      return { ...item, signedUrl }
    })
  )

  return (
    <div className="space-y-10">
      {/* ── Welcome Banner Card ── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700">
                <Sparkles size={13} />
                SRIT EDU EMPLOYEE PORTAL
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 capitalize">
                <CheckCircle2 size={12} />
                {employeeProfile.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-900">
              Welcome back, {fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
              <Building2 size={14} className="text-slate-400" />
              <span>
                Department: <strong className="text-slate-700 font-semibold">{employeeProfile.department || 'General Staff'}</strong>
              </span>
              <span>•</span>
              <span>Verified Employee ID: <strong className="font-mono text-navy-900">{employeeProfile.employee_id}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar size={14} className="text-slate-400" />
            <span>Active Member</span>
          </div>
        </div>
      </section>

      {/* ── Section A: Employee Referral Identity ── */}
      <section>
        <ReferralIdentityCard
          employeeId={employeeProfile.employee_id}
          referralCode={employeeProfile.referral_code}
          department={employeeProfile.department}
          status={employeeProfile.status}
        />
      </section>

      {/* ── Section B: Prominent Incentive Section ("Refer 2 Courses → Earn ₹5,000") ── */}
      <section className="space-y-6">
        {/* Prominent Incentive Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-900 via-navy-900 to-slate-900 p-8 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-1 text-xs font-extrabold tracking-wide uppercase text-emerald-300 backdrop-blur-xs">
                <Award size={15} />
                <span>Verified Enrollment Incentive Program</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Refer 2 Courses → Earn ₹5,000
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Receive institutional incentive rewards for every qualifying student enrollment referred through your personal link. Incentives are awarded in verified 2-sale milestones with automated payout tracking.
              </p>
            </div>

            {/* Quick Incentive Milestones Card */}
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:max-w-sm w-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block mb-3">
                Milestone Payout Schedule
              </span>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-slate-300">1 verified sale</span>
                  <span className="font-bold text-amber-300">₹0 (milestone pending)</span>
                </li>
                <li className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-white font-medium">2 verified sales</span>
                  <span className="font-extrabold text-emerald-400">₹5,000</span>
                </li>
                <li className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-white font-medium">4 verified sales</span>
                  <span className="font-extrabold text-emerald-400">₹10,000</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-white font-medium">6 verified sales</span>
                  <span className="font-extrabold text-emerald-400">₹15,000</span>
                </li>
              </ul>
              <div className="mt-3 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-[11px] font-medium text-emerald-200">
                + ₹5,000 for each subsequent pair of 2 verified sales
              </div>
            </div>
          </div>
        </div>

        {/* Live Incentive KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Verified Sales */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Verified Sales
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-navy-900">
              {verifiedSales}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {qualifiedMilestones} milestone{qualifiedMilestones === 1 ? '' : 's'} qualified
            </p>
          </div>

          {/* Card 2: Earned Incentive */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Earned
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Coins size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-700">
              ₹{totalEarnedRupees.toLocaleString('en-IN')}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Calculated automatically
            </p>
          </div>

          {/* Card 3: Paid Incentive */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Disbursed
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-navy-900">
              ₹{totalPaidRupees.toLocaleString('en-IN')}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Settled to bank account
            </p>
          </div>

          {/* Card 4: Pending Payout */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pending Payout
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-amber-700">
              ₹{pendingPayoutRupees.toLocaleString('en-IN')}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {salesNeeded} sale{salesNeeded > 1 ? 's' : ''} to next milestone
            </p>
          </div>
        </div>

        {/* Verification Rule Notice */}
        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 sm:p-5 flex items-start gap-3">
          <HelpCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-slate-600">
            <span className="font-bold text-navy-900 block">
              How Course Sales are Verified
            </span>
            <p className="leading-relaxed">
              A student referral converts into a verified sale only when the student successfully pays for a full course through Cashfree and has an active enrollment record. Cancelled, refunded, or free-tier enrollments do not count towards incentive milestones.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section C: Website Feedback Submission & History ── */}
      <section id="feedback" className="space-y-6 pt-4 border-t border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 text-xs font-bold text-purple-700 mb-2">
            <MessageSquare size={13} />
            <span>FEEDBACK PROGRAM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-navy-900">
            Website Feedback &amp; Suggestions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Share your experience testing the portal, courses, and platform features. Your feedback directly shapes new releases.
          </p>
        </div>

        {searchParams.feedbackSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Thank you! Your website feedback has been submitted successfully to administration.</span>
          </div>
        )}

        {searchParams.feedbackError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{searchParams.feedbackError}</span>
          </div>
        )}

        {/* Feedback Submission Form */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <form action={submitEmployeeFeedbackAction} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  defaultValue="general"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="general">General Platform Experience</option>
                  <option value="courses">Courses &amp; Syllabus</option>
                  <option value="materials">Study Materials &amp; PDFs</option>
                  <option value="dashboard">Student / Employee Dashboard</option>
                  <option value="mobile_ui">Mobile UI &amp; Responsiveness</option>
                  <option value="checkout">Checkout &amp; Payments</option>
                  <option value="other">Other Suggestions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Priority *
                </label>
                <select
                  name="priority"
                  defaultValue="medium"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="low">Low (Cosmetic / Nice to Have)</option>
                  <option value="medium">Medium (Standard Improvement)</option>
                  <option value="high">High (Noticeable Friction)</option>
                  <option value="critical">Critical (Immediate Attention)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                What did you explore? *
              </label>
              <input
                type="text"
                name="whatExplored"
                required
                placeholder="e.g. PCM Chapter 1 PDFs, Scholarship application flow, Mobile menu"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  What did you like? *
                </label>
                <textarea
                  name="whatLiked"
                  rows={3}
                  required
                  placeholder="Aspects that worked smoothly, design touches, or fast load times…"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Points for improvement *
                </label>
                <textarea
                  name="improvementPoints"
                  rows={3}
                  required
                  placeholder="What could be faster, clearer, or more convenient for students?"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Feature Suggestion (Optional)
              </label>
              <textarea
                name="featureSuggestion"
                rows={2}
                placeholder="Any new feature, question paper format, or tool you suggest adding…"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Attachment (Optional — Screenshot or PDF document, max 5 MB)
              </label>
              <input
                type="file"
                name="attachment"
                accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
                className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-navy-900 hover:file:bg-slate-200"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Supported formats: PNG, JPG, JPEG, WEBP, or PDF up to 5 MB. Stored privately and visible to administrators.
              </p>
            </div>

            <div className="pt-2">
              <SubmitButton
                label="Submit Feedback"
                pendingLabel="Submitting feedback…"
                className="rounded-xl bg-navy-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-navy-700 transition"
              />
            </div>
          </form>
        </div>

        {/* Recent Feedback Submissions History */}
        {feedbackList.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-navy-900">Your Recent Feedback Submissions</h3>
            <div className="grid gap-3">
              {feedbackList.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 text-xs space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900 capitalize">
                      Category: {item.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Explored:</strong> {item.what_explored}
                  </p>
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Liked:</strong> {item.what_liked}
                  </p>
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Improvement:</strong> {item.improvement_points}
                  </p>
                  {item.signedUrl && (
                    <div className="pt-1">
                      <a
                        href={item.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 transition"
                      >
                        <FileText size={12} />
                        <span>View Attachment</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Section D: Bug & Issue Reporting ── */}
      <section id="issues" className="space-y-6 pt-4 border-t border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-0.5 text-xs font-bold text-rose-700 mb-2">
            <Bug size={13} />
            <span>BUG &amp; ISSUE REPORTING</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-navy-900">
            Report Technical Issues
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Report bugs, formatting glitches, or unexpected errors encountered while testing the platform.
          </p>
        </div>

        {searchParams.issueSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Your issue report has been logged and assigned to technical administration for review.</span>
          </div>
        )}

        {searchParams.issueError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{searchParams.issueError}</span>
          </div>
        )}

        {/* Bug Reporting Form */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <form action={submitEmployeeIssueAction} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Issue Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. PDF viewer freezes on page 4 in mobile Chrome"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Page / Section *
                </label>
                <input
                  type="text"
                  name="pageSection"
                  required
                  placeholder="e.g. /checkout, /question-papers"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Device Type *
                </label>
                <select
                  name="deviceType"
                  defaultValue="desktop"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="desktop">Desktop / Laptop</option>
                  <option value="mobile">Mobile Smartphone</option>
                  <option value="tablet">Tablet / iPad</option>
                  <option value="other">Other Device</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Priority Level *
                </label>
                <select
                  name="priority"
                  defaultValue="medium"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="low">Low (Minor typo, slight alignment)</option>
                  <option value="medium">Medium (Annoying but workaround exists)</option>
                  <option value="high">High (Feature not working properly)</option>
                  <option value="critical">Critical (Page crash, payment failure)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Issue Description *
              </label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Explain the steps to reproduce the issue, what happened, and what you expected to happen…"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Attachment (Optional — Screenshot or PDF document, max 5 MB)
              </label>
              <input
                type="file"
                name="attachment"
                accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
                className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-navy-900 hover:file:bg-slate-200"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Supported formats: PNG, JPG, JPEG, WEBP, or PDF up to 5 MB. Stored privately and accessible only by administrators.
              </p>
            </div>

            <div className="pt-2">
              <SubmitButton
                label="Submit Bug Report"
                pendingLabel="Submitting report…"
                className="rounded-xl bg-navy-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-navy-700 transition"
              />
            </div>
          </form>
        </div>

        {/* Recent Issues Reported History */}
        {issueList.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-navy-900">Your Reported Issues</h3>
            <div className="grid gap-3">
              {issueList.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 text-xs space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900">{item.title}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                        item.resolution_status === 'resolved' || item.resolution_status === 'closed'
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                          : item.resolution_status === 'in_progress'
                          ? 'border border-blue-200 bg-blue-50 text-blue-700'
                          : 'border border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                    >
                      Status: {item.resolution_status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Section:</strong> {item.page_section} •{' '}
                    <strong className="text-slate-800">Device:</strong> {item.device_type}
                  </p>
                  <p className="text-slate-600">{item.description}</p>
                  {item.signedUrl && (
                    <div className="pt-1">
                      <a
                        href={item.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 transition"
                      >
                        <FileText size={12} />
                        <span>View Attachment</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
