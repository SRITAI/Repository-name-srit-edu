import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const DEMO_MODE_ERROR = 'Supabase is not configured. Running SRIT EDU in demo mode.'

type DemoResult = { data: any; error: Error | null }

function createDemoQuery() {
  const result: DemoResult = { data: [], error: null }
  const query: any = {
    select: () => query,
    eq: () => query,
    order: () => query,
    limit: () => query,
    maybeSingle: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: new Error(DEMO_MODE_ERROR) }),
    update: () => query,
    delete: () => query,
    then: (resolve: (value: DemoResult) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  }
  return query
}

function createDemoClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: new Error(DEMO_MODE_ERROR) }),
      signUp: async () => ({ data: { user: null }, error: new Error(DEMO_MODE_ERROR) }),
      resetPasswordForEmail: async () => ({ data: null, error: new Error(DEMO_MODE_ERROR) }),
      updateUser: async () => ({ data: { user: null }, error: new Error(DEMO_MODE_ERROR) }),
      verifyOtp: async () => ({ data: { user: null }, error: new Error(DEMO_MODE_ERROR) }),
      signOut: async () => ({ error: null }),
    },
    from: () => createDemoQuery(),
    rpc: async () => ({ data: null, error: new Error(DEMO_MODE_ERROR) }),
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Supabase is intentionally optional during the frontend/demo phase.
  // Once these environment variables are added in Vercel, the real client is used.
  if (!url || !key) return createDemoClient() as any

  const cookieStore = cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(
        cookiesToSet: {
          name: string
          value: string
          options?: {
            path?: string
            domain?: string
            maxAge?: number
            expires?: Date
            httpOnly?: boolean
            secure?: boolean
            sameSite?: 'strict' | 'lax' | 'none'
          }
        }[],
      ) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
      },
    },
  })
}
