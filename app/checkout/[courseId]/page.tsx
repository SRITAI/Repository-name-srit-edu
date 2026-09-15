import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPaise } from '@/lib/format'

export default async function CheckoutPage({
  params,
}: {
  params: { courseId: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirectTo=/checkout/${params.courseId}`)
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, price_paise, original_price_paise')
    .eq('id', params.courseId)
    .eq('is_published', true)
    .maybeSingle()

  if (!course) {
    return (
      <div className="container max-w-lg py-16">
        <p className="text-neutral-600">Course not found.</p>
      </div>
    )
  }

  return (
    <div className="container max-w-lg py-16">
      <h1 className="text-2xl font-semibold text-navy-900">{course.title}</h1>
      <p className="mt-2 text-3xl font-semibold text-navy-900">
        {formatPaise(course.price_paise)}
      </p>

      <div className="mt-8 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm text-neutral-600">
        Online payments aren&apos;t switched on yet — Razorpay checkout is the next build step.
        Once it&apos;s live, completing payment here will enroll you automatically and the course
        will appear in <span className="font-medium text-navy-900">My Courses</span>.
      </div>
    </div>
  )
}
