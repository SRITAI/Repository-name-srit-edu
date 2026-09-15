import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ScholarshipForm } from '@/components/forms/scholarship-form'

export default async function ScholarshipPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="container max-w-3xl py-14">
      <h1 className="text-3xl font-semibold text-navy-900">
        SRIT EDU Scholarship Program — ₹17,000
      </h1>
      <p className="mt-3 text-neutral-600">
        Apply now and complete your application for consideration under the SRIT EDU Scholarship
        Program. Applications are reviewed against the program&apos;s eligibility and selection
        criteria — submitting an application does not guarantee an award.
      </p>

      {searchParams.success && (
        <div className="mt-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Application submitted. Your application ID is{' '}
          <span className="font-semibold">{searchParams.success}</span> — keep it for reference.
          You can check your status from your dashboard.
        </div>
      )}
      {searchParams.error && (
        <div className="mt-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {searchParams.error}
        </div>
      )}

      {!user ? (
        <div className="mt-8 rounded-lg border border-dashed border-neutral-300 p-6 text-sm text-neutral-600">
          Please{' '}
          <Link href="/login?redirectTo=/scholarship" className="font-medium text-blue-500">
            log in
          </Link>{' '}
          or{' '}
          <Link href="/signup" className="font-medium text-blue-500">
            create an account
          </Link>{' '}
          to apply.
        </div>
      ) : (
        <ScholarshipForm />
      )}

      <section className="mt-14">
        <h2 className="text-xl font-semibold text-navy-900">Eligibility &amp; Process</h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-600">
          <li>Open to students preparing for their board examinations.</li>
          <li>Fill in the application below with accurate personal, school, and family details.</li>
          <li>Applications are reviewed by the SRIT EDU team; status updates appear on your dashboard.</li>
          <li>Selection is subject to eligibility and verification under the program&apos;s terms.</li>
        </ul>
      </section>
    </div>
  )
}
