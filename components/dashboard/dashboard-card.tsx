import Link from 'next/link'

export function DashboardCard({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-neutral-200 p-5 transition hover:border-blue-500"
    >
      <h3 className="font-semibold text-navy-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{description}</p>
    </Link>
  )
}
