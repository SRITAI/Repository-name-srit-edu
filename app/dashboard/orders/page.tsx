import { createClient } from '@/lib/supabase/server'
import { formatPaise } from '@/lib/format'

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-50 text-green-700',
  created: 'bg-neutral-100 text-neutral-600',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-neutral-100 text-neutral-600',
}

export default async function OrderHistoryPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, amount_paise, status, created_at, courses(title), question_papers(subject, year)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-900">Order History</h1>

      {!orders?.length && (
        <p className="mt-6 text-sm text-neutral-600">
          No orders yet — orders will appear here once payments are enabled.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {orders?.map((order: any) => {
          const item = (order.courses as any)?.title
            ? (order.courses as any).title
            : (order.question_papers as any)
              ? `${(order.question_papers as any).subject} (${(order.question_papers as any).year})`
              : 'Item'

          return (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-neutral-100 p-4"
            >
              <div>
                <p className="font-medium text-navy-900">{item}</p>
                <p className="text-sm text-neutral-500">
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-navy-900">{formatPaise(order.amount_paise)}</p>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[order.status] ?? 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
