import { createClient } from '@/lib/supabase/server'
import { Field } from '@/components/forms/field'
import { updateProfileAction, updatePasswordAction } from './actions'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string; pwSuccess?: string; pwError?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, mobile_number, email')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-navy-900">Profile</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-navy-900">Account details</h2>
        {searchParams.success && (
          <p className="mt-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            Profile updated.
          </p>
        )}
        {searchParams.error && (
          <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </p>
        )}

        <div className="mt-4 space-y-1 text-sm text-neutral-600">
          <p>
            Mobile number: <span className="font-medium text-navy-900">{profile?.mobile_number}</span>
          </p>
          <p>
            Email: <span className="font-medium text-navy-900">{profile?.email}</span>
          </p>
          <p className="text-xs text-neutral-500">
            Mobile number and email are tied to your login and aren&apos;t editable here yet.
          </p>
        </div>

        <form action={updateProfileAction} className="mt-4 space-y-4">
          <Field label="Full Name" name="fullName" required defaultValue={profile?.full_name ?? ''} />
          <button
            type="submit"
            className="rounded bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
          >
            Save changes
          </button>
        </form>
      </section>

      <section className="mt-10 border-t border-neutral-100 pt-8">
        <h2 className="text-lg font-semibold text-navy-900">Change password</h2>
        {searchParams.pwSuccess && (
          <p className="mt-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            Password updated.
          </p>
        )}
        {searchParams.pwError && (
          <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.pwError}
          </p>
        )}
        <form action={updatePasswordAction} className="mt-4 space-y-4">
          <Field label="New Password" name="newPassword" type="password" required minLength={8} />
          <Field
            label="Confirm New Password"
            name="confirmNewPassword"
            type="password"
            required
            minLength={8}
          />
          <button
            type="submit"
            className="rounded bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
          >
            Update password
          </button>
        </form>
      </section>
    </div>
  )
}
