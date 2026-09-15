import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

type DemoResult = { data: any; error: null }

function createDemoClient() {
  const builder: any = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    upsert: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    order: () => builder,
    limit: () => builder,
    single: async (): Promise<DemoResult> => ({ data: null, error: null }),
    maybeSingle: async (): Promise<DemoResult> => ({ data: null, error: null }),
    then: (resolve: (value: DemoResult) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve({ data: [], error: null }).then(resolve, reject),
  }

  return {
    from: () => builder,
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
    },
  }
}

export function createClient() {
  if (!isSupabaseConfigured) return createDemoClient()

  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )
}
