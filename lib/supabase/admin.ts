import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service-role client. NEVER import this into a Client Component or
// anywhere that ships to the browser — it bypasses Row Level Security.
// Use it only inside API route handlers that have already checked the
// caller's identity/role themselves: signed PDF URLs, Razorpay webhooks,
// admin mutations.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
