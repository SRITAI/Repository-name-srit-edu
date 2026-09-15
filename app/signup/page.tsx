import Link from 'next/link'
import { Field } from '@/components/forms/field'
import { signupAction } from './actions'

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="container max-w-md py-16">
      <h1 className="text-2xl font-semibold text-navy-900">Create your account</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Start your PCM/PCB preparation with SRIT EDU.
      </p>

      {searchParams.error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={signupAction} className="mt-6 space-y-4">
        <Field label="Full Name" name="fullName" required />
        <Field label="Mobile Number" name="mobileNumber" type="tel" required pattern="[0-9]{10}" />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required minLength={8} />
        <Field
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
        />
        <button
          type="submit"
          className="w-full rounded bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          Sign up
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-blue-500">
          Log in
        </Link>
      </p>
    </div>
  )
}
