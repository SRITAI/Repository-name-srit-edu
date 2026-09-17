import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  Ticket,
  Megaphone,
  ShoppingCart,
  ArrowRight,
  Book,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const sections = [
  {
    title: 'Students',
    description: 'Manage registered students and profiles',
    href: '/admin/students',
    icon: Users,
  },
  {
    title: 'Courses',
    description: 'Manage PCM, PCB and course content',
    href: '/admin/courses',
    icon: BookOpen,
  },
  {
    title: 'Chapters',
    description: 'Manage course chapters for study materials',
    href: '/admin/chapters',
    icon: Book,
  },
  {
    title: 'Study Materials',
    description: 'Upload and manage protected PDFs',
    href: '/admin/materials',
    icon: FileText,
  },
  {
    title: 'Scholarships',
    description: 'Review scholarship applications',
    href: '/admin/scholarships',
    icon: GraduationCap,
  },
  {
    title: 'Coupons',
    description: 'Create and manage discount coupons',
    href: '/admin/coupons',
    icon: Ticket,
  },
  {
    title: 'Updates',
    description: 'Publish announcements and updates',
    href: '/admin/updates',
    icon: Megaphone,
  },
  {
    title: 'Orders',
    description: 'View orders and enrollment records',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
]

export default async function AdminPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <div className="container">
        <div className="rounded-lg bg-navy p-6 text-white">
          <p className="text-sm text-blue-500">SRIT EDU — ADMIN</p>
          <h1 className="mt-2 text-2xl font-semibold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-white/70">
            Manage students, courses, study materials and platform operations.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon

            return (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-lg border border-neutral-200 bg-white p-5 transition hover:border-blue-500 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-neutral-100 p-3 text-navy">
                    <Icon size={22} />
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-neutral-600 transition group-hover:translate-x-1 group-hover:text-blue-500"
                  />
                </div>

                <h2 className="mt-4 font-semibold text-navy-900">
                  {section.title}
                </h2>

                <p className="mt-1 text-sm text-neutral-600">
                  {section.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
