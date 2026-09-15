import Link from 'next/link'
import { Field } from '@/components/forms/field'
import { forgotPasswordAction } from './actions'

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-2xl font-semibold text-navy-900">Forgot password</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Enter your account email and we&apos;ll send you a reset link.
      </p>

      {searchParams.message && (
        <p className="mt-4 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          {searchParams.message}
        </p>
      )}
      {searchParams.error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={forgotPasswordAction} className="mt-6 space-y-4">
        <Field label="Email" name="email" type="email" required />
        <button
          type="submit"
          className="w-full rounded bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-600">
        <Link href="/login" className="font-medium text-blue-500">
          Back to log in
        </Link>
      </p>
    </div>
  )
}
