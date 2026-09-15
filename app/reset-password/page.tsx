import { Field } from '@/components/forms/field'
import { resetPasswordAction } from './actions'

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-2xl font-semibold text-navy-900">Set a new password</h1>
      <p className="mt-1 text-sm text-neutral-600">
        You followed a password reset link — choose a new password below.
      </p>

      {searchParams.error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={resetPasswordAction} className="mt-6 space-y-4">
        <Field label="New Password" name="password" type="password" required minLength={8} />
        <Field
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
        />
        <button
          type="submit"
          className="w-full rounded bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          Update password
        </button>
      </form>
    </div>
  )
}
