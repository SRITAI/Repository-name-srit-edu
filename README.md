# SRIT EDU — Step 1 + Step 2

Step 1: brand theme, Supabase clients, full schema + RLS.
Step 2: full public site, authentication (signup/login/forgot-password/reset),
route-protected student dashboard, and a real (non-payment) checkout stub.

## What's here now

- **Public pages**: home, courses, PCM, PCB, question papers, scholarship
  (with application form), updates, about, contact.
- **Auth**: `/login` (email or mobile number), `/signup`, `/forgot-password`,
  `/reset-password`, `/auth/confirm` (handles both the signup-confirmation
  and password-reset email links).
- **Student dashboard** (`/dashboard`, `/dashboard/my-courses`,
  `/dashboard/orders`, `/dashboard/profile`) — protected by `middleware.ts`
  (redirects to `/login`) and again at the layout level in
  `app/dashboard/layout.tsx`.
- **`supabase/migrations/0002_scholarship_and_contact.sql`** — adds the
  missing student-facing INSERT policy on `scholarship_applications`, a
  `contact_messages` table, and a Postgres function that generates
  application IDs (`SRIT-SCH-2026-000123`) atomically.
- **`supabase/seed.sql`** — sample PCM/PCB courses, question papers, and one
  announcement, so the site isn't empty on a fresh database. Clearly test
  data — swap for real content once the admin panel exists.
- **No payment code.** `Buy Now` goes to a real `/checkout/[courseId]` page
  that states payments aren't live yet — nothing fakes a purchase.

## Setup

1. `npm install`
2. Run both migrations in order against your Supabase project:
   `supabase db push`, or paste `0001_init.sql` then `0002_scholarship_and_contact.sql`
   into the SQL editor.
3. Optionally run `seed.sql` the same way to get sample courses/papers.
4. Copy `.env.example` to `.env.local` and fill in your real values.
5. **Supabase email templates** — in your Supabase dashboard, go to
   Authentication → Email Templates and point both templates at this app's
   confirmation route instead of Supabase's default:
   - **Confirm signup**: set the link to
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/login`
   - **Reset password**: set the link to
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`

   Without this change, the emailed links will hit Supabase's own verify
   endpoint instead of this app, and `/reset-password` will never get a
   session to act on.
6. `npm run dev`, then open `http://localhost:3000`.

## Testing the auth flow locally

1. `/signup` → create an account. If your Supabase project has **email
   confirmations enabled** (the default for new projects), the account
   can't log in until the confirmation link is clicked — check the
   Supabase dashboard's Auth logs (or your inbox) for it. To skip this
   while testing, turn confirmations off under Authentication → Providers
   → Email.
2. Check the `profiles` table in the Supabase table editor — a row should
   have appeared automatically (via the `handle_new_user()` trigger) with
   the name/mobile number from signup.
3. `/login` — try both the email and the mobile number you signed up with.
4. Visit `/dashboard` while logged out — you should be bounced to `/login`.
   Log in and it should let you through.
5. `/forgot-password` → follow the emailed link → you should land on
   `/reset-password` with a working form (this is the step that depends on
   the email template change above).
6. `/scholarship` — log in, submit the form, confirm you get an
   application number back and a row appears in `scholarship_applications`.
7. `/contact-us` — submit the form, confirm a row appears in
   `contact_messages`.

## Next steps

Razorpay order/verify/webhook, protected PDF signed-URL access, coupons,
and the admin dashboard are next, per the build order in the architecture
doc — each is a good unit to hand to Claude Code against this repo.
