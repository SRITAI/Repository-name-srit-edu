type FieldProps = {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
  pattern?: string
  minLength?: number
}

export function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  defaultValue,
  pattern,
  minLength,
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-navy-900">
        {label}
        {required && <span className="text-blue-500"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        pattern={pattern}
        minLength={minLength}
        className="mt-1.5 w-full rounded border border-neutral-300 px-3 py-2 text-sm text-navy-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </label>
  )
}

export function TextAreaField({
  label,
  name,
  required,
  placeholder,
  rows = 4,
}: {
  label: string
  name: string
  required?: boolean
  placeholder?: string
  rows?: number
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-navy-900">
        {label}
        {required && <span className="text-blue-500"> *</span>}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="mt-1.5 w-full rounded border border-neutral-300 px-3 py-2 text-sm text-navy-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </label>
  )
}
