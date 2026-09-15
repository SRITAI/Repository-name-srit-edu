import Link from 'next/link'
import { Field } from '@/components/forms/field'
import { loginAction } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string; redirectTo?: string }
}) {
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-2xl font-semibold text-navy-900">Log in</h1>
      <p className="mt-1 text-sm text-neutral-600">Welcome back to SRIT EDU.</p>

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

      <form action={loginAction} className="mt-6 space-y-4">
        <input type="hidden" name="redirectTo" value={searchParams.redirectTo ?? '/dashboard'} />
        <Field label="Email or Mobile Number" name="identifier" required />
        <Field label="Password" name="password" type="password" required />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-blue-500">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full rounded bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-600">
        New here?{' '}
        <Link href="/signup" className="font-medium text-blue-500">
          Create an account
        </Link>
      </p>
    </div>
  )
}
