import Image from 'next/image'
import Link from 'next/link'
import { Field } from '@/components/forms/field'
import { SubmitButton } from '@/components/forms/submit-button'
import { employeeLoginAction } from './actions'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function EmployeeLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="container max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to SRIT EDU Website
        </Link>

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 sm:p-10 shadow-xl shadow-slate-200/40 backdrop-blur-md">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 shadow-xs border border-slate-200/80">
              <Image
                src="/logo/sritedu-logo.png"
                alt="SRIT EDU Logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-700">
              <ShieldCheck size={13} />
              <span>EMPLOYEE PORTAL</span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-navy-900">
              Employee Sign In
            </h1>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Log in with your official employee credentials to access your referral program and feedback dashboard.
            </p>
          </div>

          {searchParams.message && (
            <p className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-800">
              {searchParams.message}
            </p>
          )}

          {searchParams.error && (
            <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
              {searchParams.error}
            </p>
          )}

          <form action={employeeLoginAction} className="mt-6 space-y-4">
            <Field
              label="Email or Mobile Number"
              name="identifier"
              required
              placeholder="employee@sritedu.com or mobile"
            />
            <Field
              label="Password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />

            <SubmitButton
              label="Sign in to Employee Portal"
              pendingLabel="Verifying credentials…"
              className="w-full rounded-xl bg-navy-900 py-3 text-sm font-semibold text-white shadow-sm hover:bg-navy-700 transition"
            />
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              SRIT EDU Authorized Staff Only. Employee accounts are created and configured by administration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
