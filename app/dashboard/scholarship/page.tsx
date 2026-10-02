import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  FileCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const STATUS_BADGES: Record<string, { label: string; badge: string }> = {
  submitted: {
    label: 'Submitted',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/60',
  },
  under_review: {
    label: 'Under Review',
    badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
  },
  approved: {
    label: 'Approved',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  },
  rejected: {
    label: 'Rejected',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
  },
}

export default async function StudentScholarshipDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard/scholarship')
  }

  // Fetch all applications strictly for the authenticated student
  const { data: applications, error } = await (supabase as any)
    .from('scholarship_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const currentApp = applications && applications.length > 0 ? applications[0] : null
  const pastApps = applications && applications.length > 1 ? applications.slice(1) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-900">
            Scholarship Application
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your SRIT EDU ₹17,000 scholarship review status and administrative remarks.
          </p>
        </div>

        {!currentApp && (
          <Link
            href="/scholarship"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-navy-800 transition active:scale-98"
          >
            <GraduationCap size={16} /> Apply Now
          </Link>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm font-medium text-rose-700">
          Unable to load your scholarship application records. Please refresh the page.
        </div>
      ) : !currentApp ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-10 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-navy-900">
            No Scholarship Application Found
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
            You have not submitted an application for the SRIT EDU ₹17,000 scholarship program
            yet. Complete your submission today.
          </p>
          <div className="mt-6">
            <Link
              href="/scholarship"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-navy-800 transition active:scale-98"
            >
              Start Application <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Application Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-xs backdrop-blur-xs">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Application Number
                </span>
                <h2 className="mt-1 font-mono text-xl font-bold text-navy-900">
                  {currentApp.application_number}
                </h2>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    STATUS_BADGES[currentApp.status]?.badge ?? 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {currentApp.status === 'approved' ? (
                    <CheckCircle size={14} />
                  ) : currentApp.status === 'rejected' ? (
                    <XCircle size={14} />
                  ) : (
                    <Clock size={14} />
                  )}
                  {STATUS_BADGES[currentApp.status]?.label ?? currentApp.status}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Scholarship Amount
                </span>
                <p className="mt-1 text-xl font-extrabold text-navy-900">
                  ₹{Number(currentApp.scholarship_amount || 17000).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Submitted On
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {new Date(currentApp.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Target Class
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-800">{currentApp.class}</p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Application Review Timeline
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {/* Step 1: Submitted */}
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                    <FileCheck size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy-900">Submitted</p>
                    <p className="text-xs text-slate-500">Application lodged</p>
                  </div>
                </div>

                {/* Step 2: Under Review */}
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs text-white ${
                      currentApp.status === 'under_review' ||
                      currentApp.status === 'approved' ||
                      currentApp.status === 'rejected'
                        ? 'bg-amber-500'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy-900">Under Review</p>
                    <p className="text-xs text-slate-500">Verification in progress</p>
                  </div>
                </div>

                {/* Step 3: Final Decision */}
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs text-white ${
                      currentApp.status === 'approved'
                        ? 'bg-emerald-600'
                        : currentApp.status === 'rejected'
                          ? 'bg-rose-600'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {currentApp.status === 'approved' ? (
                      <CheckCircle size={16} />
                    ) : currentApp.status === 'rejected' ? (
                      <XCircle size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy-900">Decision</p>
                    <p className="text-xs text-slate-500 capitalize">
                      {currentApp.status === 'approved'
                        ? 'Approved'
                        : currentApp.status === 'rejected'
                          ? 'Rejected'
                          : 'Pending decision'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Remarks */}
            {currentApp.admin_remarks && (
              <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Administrative Remarks
                    </p>
                    <p className="mt-1 text-sm font-medium text-amber-800 leading-relaxed">
                      {currentApp.admin_remarks}
                    </p>
                    {currentApp.reviewed_at && (
                      <p className="mt-2 text-xs text-amber-700 font-medium">
                        Updated:{' '}
                        {new Date(currentApp.reviewed_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submitted Applicant Details */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-xs backdrop-blur-xs">
            <h3 className="font-bold text-navy-900 text-base">Submitted Applicant Information</h3>

            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Personal Details
                </h4>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="inline text-slate-500">Name: </dt>
                    <dd className="inline font-semibold text-navy-900">{currentApp.full_name}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Mobile: </dt>
                    <dd className="inline font-semibold text-navy-900">{currentApp.mobile_number}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Email: </dt>
                    <dd className="inline font-semibold text-navy-900">
                      {currentApp.email || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Residential Address: </dt>
                    <dd className="inline font-semibold text-navy-900">
                      {currentApp.address || currentApp.school_address || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">District / State: </dt>
                    <dd className="inline font-semibold text-navy-900">
                      {currentApp.district}, {currentApp.state}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Academic &amp; Family Details
                </h4>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="inline text-slate-500">Class: </dt>
                    <dd className="inline font-semibold text-navy-900">{currentApp.class}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Education / Stream: </dt>
                    <dd className="inline font-semibold text-navy-900">
                      {currentApp.education || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">School Name: </dt>
                    <dd className="inline font-semibold text-navy-900">{currentApp.school_name}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Father&apos;s Name: </dt>
                    <dd className="inline font-semibold text-navy-900">{currentApp.father_name}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Mother&apos;s Name: </dt>
                    <dd className="inline font-semibold text-navy-900">{currentApp.mother_name}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-500">Category / Caste: </dt>
                    <dd className="inline font-semibold text-navy-900">
                      {currentApp.caste || '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Past Applications Table (if any) */}
          {pastApps.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-xs backdrop-blur-xs">
              <h3 className="font-bold text-navy-900 text-base">Previous Applications</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3">Application ID</th>
                      <th className="py-3 px-3">Submitted</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pastApps.map((app: any) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-navy-900">{app.application_number}</td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {new Date(app.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${
                              STATUS_BADGES[app.status]?.badge ?? 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
