# SRIT EDU — Step 1 Scaffold

This is the starting point from the architecture doc: brand theme wired up, Supabase clients ready, and the full schema + RLS as a runnable migration. Pages, auth, Razorpay, and the dashboards are the next steps — build those out in an environment with internet access (your machine, or Claude Code), since this scaffold was assembled in a sandbox with no network access to actually install packages or connect to Supabase/Razorpay.

## What's here

- `tailwind.config.ts` / `app/globals.css` — the brand theme: navy `#233e5f`, blue `#10588c`/`#0090d1` measured from your logo, and "Hind" as one typeface covering both Hindi and English.
- `app/layout.tsx`, `components/layout/` — root layout, header (using your logo file, unmodified), footer with the link structure from your spec.
- `lib/supabase/` — three clients: `client.ts` (browser), `server.ts` (Server Components/Route Handlers, respects RLS), `admin.ts` (service-role, server-only — for signed PDF URLs, webhooks, admin writes).
- `supabase/migrations/0001_init.sql` — every table from the architecture doc, indexes, Row Level Security policies, and a trigger that creates a `profiles` row on signup.
- `public/logo/sritedu-logo.png` — your uploaded logo, copied in as-is.
- `.env.example` — see the note below on variable names.

## Setup

1. `npm install`
2. Create a Supabase project, then run the migration: `supabase db push` (or paste `0001_init.sql` into the SQL editor).
3. Copy `.env.example` to `.env.local` and fill in your real Supabase/Razorpay values.
4. `npm run dev`

## One naming note

Your original env var list used `SUPABASE_URL` / `SUPABASE_ANON_KEY`. Next.js only exposes browser-side env vars if they're prefixed `NEXT_PUBLIC_`, so those two are renamed `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` here. `SUPABASE_SERVICE_ROLE_KEY` and the Razorpay secret/webhook keys keep no prefix on purpose — that's what keeps them off the client bundle.

## Next steps

Follow the build order in the architecture doc: auth → public course pages → Razorpay order/verify/webhook → protected PDF access → dashboards → scholarship → coupons → admin. Each step can be handed to Claude Code as its own task against this repo.
