import { Field, TextAreaField } from '@/components/forms/field'
import { submitContactMessage } from './actions'

export default function ContactUsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  return (
    <div className="container max-w-3xl py-14">
      <h1 className="text-3xl font-semibold text-navy-900">Contact Us</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Questions about a course, the scholarship program, or anything else — send us a message.
      </p>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <div>
          {searchParams.success && (
            <div className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Message sent — we&apos;ll get back to you soon.
            </div>
          )}
          {searchParams.error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {searchParams.error}
            </div>
          )}

          <form action={submitContactMessage} className="space-y-4">
            <Field label="Name" name="name" required />
            <Field label="Mobile Number" name="mobileNumber" type="tel" required />
            <Field label="Email" name="email" type="email" required />
            <TextAreaField label="Message" name="message" required rows={5} />
            <button
              type="submit"
              className="rounded bg-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="text-sm text-neutral-600">
          <h2 className="font-semibold text-navy-900">Support</h2>
          <p className="mt-2">Phone: [add your support phone number]</p>
          <p className="mt-1">Email: [add your support email address]</p>
          <p className="mt-1">Address: [add your office address]</p>
          <h2 className="mt-6 font-semibold text-navy-900">Follow SRIT EDU</h2>
          <p className="mt-2">[add your social media links]</p>
        </div>
      </div>
    </div>
  )
}
