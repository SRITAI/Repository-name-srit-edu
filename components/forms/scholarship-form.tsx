import { Field, TextAreaField } from '@/components/forms/field'
import { submitScholarshipApplication } from '@/app/scholarship/actions'

export function ScholarshipForm() {
  return (
    <form action={submitScholarshipApplication} className="mt-8 space-y-8">
      <fieldset className="space-y-4">
        <legend className="border-b border-neutral-100 pb-2 text-base font-semibold text-navy-900">
          Personal Information
        </legend>
        <Field label="Full Name" name="fullName" required />
        <Field label="Mobile Number" name="mobileNumber" type="tel" required pattern="[0-9]{10}" />
        <Field label="Email Address (Optional)" name="email" type="email" />
        <Field label="Class" name="class" required placeholder="e.g. Class 12" />
        <Field label="Education" name="education" placeholder="e.g. UP Board, Science stream" />
        <Field label="School Name" name="schoolName" required />
        <TextAreaField label="School Address" name="schoolAddress" required rows={2} />
        <Field label="District" name="district" required />
        <Field label="State" name="state" required />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="border-b border-neutral-100 pb-2 text-base font-semibold text-navy-900">
          Family Information
        </legend>
        <Field label="Father's Name" name="fatherName" required />
        <Field label="Mother's Name" name="motherName" required />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="border-b border-neutral-100 pb-2 text-base font-semibold text-navy-900">
          Other Information
        </legend>
        <Field label="Caste" name="caste" />
      </fieldset>

      <button
        type="submit"
        className="w-full rounded bg-navy px-4 py-3 text-sm font-medium text-white hover:bg-blue-600 sm:w-auto"
      >
        Submit Application
      </button>
    </form>
  )
}
