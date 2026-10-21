# Supabase setup for this exact checkout

This guide was checked against the application routes, RPCs, five migration files and the official Supabase documentation on 2026-10-20. No remote project was modified and nothing was deployed publicly.

## Configure values privately

Use the environment's private Variables/Secrets settings if available. Put `SUPABASE_SERVICE_ROLE_KEY` and any scanning token in encrypted secret fields, with access limited to this application environment. The public URL, publishable key and application origin are ordinary variables. Apply the environment configuration/restart workflow after saving.

Alternatively, use the workspace's private editor or your own trusted terminal to create **`/workspace/sritedu/.env.local`** from `.env.example`, and restrict it to the owner (`chmod 600 .env.local`). Preserve an existing file rather than overwriting it. `.env.local` is ignored by Git. Do not place it in `public/`, screenshots, issue bodies, browser code, command-line arguments or chat. Never paste a service key, database password, access token, account password, session cookie or email verification link into chat.

Get the API URL and publishable key from your intended Supabase project's Connect/API Keys settings. For this checkout's server credential, use a **Supabase secret key (`sb_secret_…`)** from that same project. An existing legacy `service_role` JWT also works. The application keeps the variable name `SUPABASE_SERVICE_ROLE_KEY` for compatibility and passes its value to the Supabase SDK; it does not require a JWT. Both credential types have privileged server access. Never use a `NEXT_PUBLIC_` prefix. Do not substitute a personal Supabase access token, a database password, or the publishable/anon key for that server credential.

| Application variable                   | Required?                               | Exact purpose / value                                                                                                                                                   |
| -------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes                                     | `https://YOUR_PROJECT_REF.supabase.co`; local stack: `http://127.0.0.1:54321`                                                                                           |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes                                     | That same project's publishable key; the local CLI's legacy anon JWT also works                                                                                         |
| `SUPABASE_SERVICE_ROLE_KEY`            | Yes for media/account/operator features | Same project's server-only secret key (`sb_secret_…`), or an existing legacy `service_role` JWT                                                                         |
| `NEXT_PUBLIC_APP_URL`                  | Yes                                     | Canonical browser origin, **without trailing slash**. Local-only: `http://localhost:3000`. For phone use, the environment-assigned HTTPS preview origin, once available |
| `NEXT_PUBLIC_ENABLE_PREVIEW`           | Recommended during review               | `true`; `/preview/*` remains explicitly fictional and separate from live auth                                                                                           |
| `GOOGLE_AUTH_ENABLED`                  | Optional                                | `false` until Supabase's Google provider has real credentials                                                                                                           |
| `MAX_IMAGE_MB`                         | Optional                                | `10`                                                                                                                                                                    |
| `MAX_VIDEO_MB`                         | Optional                                | `50`; the route and processed video also have a hard 50 MB cap                                                                                                          |
| `MEDIA_SCAN_URL`                       | Optional                                | HTTPS endpoint of a scanner you actually configured; leave unset otherwise                                                                                              |
| `MEDIA_SCAN_TOKEN`                     | Optional secret                         | Server-only scanner credential; never expose it to the browser                                                                                                          |

Legacy integrations may use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead of `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The app accepts that alias consistently in browser, server and session refresh; the publishable-key value takes precedence when both are set.

The app checks mutation request origins against `NEXT_PUBLIC_APP_URL`. Set it to the **actual origin from which you are using the app**, including an environment preview hostname when applicable. Merely binding the server to `0.0.0.0` does not create a phone-accessible URL. `localhost` on your phone refers to the phone.

For live testing from a phone, use the hosted project's HTTPS Supabase URL. A local `127.0.0.1:54321` backend is not reachable by the phone's browser client or its Realtime WebSocket; sharing only the Next.js port does not forward that backend.

For `next start`, public variables and the CSP are part of the build. Rebuild **after** configuring them, then restart the server. Do not leave an old no-credentials build serving after adding keys:

```bash
cd /workspace/sritedu
npm run build
npm run start -- --port 3000
```

For `next dev`, restart after environment changes. Keep the configured values out of process listings and logs. This environment currently has no callable inbound preview/port-sharing tool and no assigned preview URL; those must be supplied by its supported Preview/Ports interface before a phone URL can be verified. No temporary public tunnel or public deployment has been created.

## Apply migrations to the intended project

This repository now contains the community application in place of the former education application. The five migrations below are a **fresh-install schema**, not an upgrade for the old education database. Use a new, empty Supabase project for this setup. Reusing existing education data requires a separately reviewed migration and data-transfer plan because table names and auth triggers overlap. Replacing the GitHub source does not change, reset or migrate that database; no live database migration was run for this replacement.

From your own trusted terminal, authenticate with the Supabase CLI and select the project reference. Supply CLI authentication/database credentials through its private login prompt or secret manager, never chat or an inline `--password` argument.

```bash
cd /workspace/sritedu
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

Apply these **unchanged files in this order**, which the CLI derives from their filenames:

| Order | File                                                    | Contents                                                                                                              |
| ----- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1     | `supabase/migrations/202610200001_core.sql`             | Tables, constraints/indexes, RLS, ownership/consent/write RPCs, private bucket, messages/notifications publication    |
| 2     | `supabase/migrations/202610200002_communities.sql`      | Ten editable community definitions; no fake production members or posts                                               |
| 3     | `supabase/migrations/202610200003_media_operations.sql` | Upload tickets, finalization/rechecks, private media/avatar access, audited reported evidence, cleanup and role setup |
| 4     | `supabase/migrations/202610200004_evidence_grants.sql`  | Direct evidence-column access removed; audited case RPC required                                                      |
| 5     | `supabase/migrations/202610200005_operations.sql`       | Aggregate metrics, appeals/restoration, reported-item removal, resolution timestamps, unread counts                   |

Use migration history, rather than pasting files repeatedly. `supabase db reset` is for the **disposable local database only**; do not use it against hosted data. These migrations expect the standard Supabase `auth`, `storage`, `anon`, `authenticated`, `service_role` and `supabase_realtime` infrastructure, not a bare hosted PostgreSQL database. Expose the `public` API schema; do not expose `private`.

For an isolated local stack, use the Local Supabase commands in the README. `scripts/local-env.mjs` accepts modern CLI `PUBLISHABLE_KEY`/`SECRET_KEY` or legacy `ANON_KEY`/`SERVICE_ROLE_KEY`, writes a new owner-only `.env.local`, and refuses to overwrite an existing file. Update existing configuration privately in the editor rather than deleting it to rerun the helper.

## Storage: one private bucket and no client object policies

The migration creates **one bucket** for avatars, post media, message media and posters:

| Setting            | Required value                          |
| ------------------ | --------------------------------------- |
| ID and name        | `private-media`                         |
| Public             | **false**                               |
| File size limit    | `52428800` bytes (50 MiB)               |
| Allowed MIME types | `image/webp`, `video/mp4`, `video/webm` |

Raw uploads accept JPEG/PNG/WebP images and MP4/WebM clips; the server re-encodes images to WebP, videos to MP4 and posters to WebP **before storing them**. Therefore the bucket does not need to accept raw JPEG or PNG files. Images default to a 10 MiB input cap, clips to 50 MiB and 90 seconds. Before transfer, the browser prepares photos as WebP at a maximum 2048-pixel edge and targets at most 3 MiB; the server independently validates and re-encodes the received image. Install FFmpeg and FFprobe on the Node host.

**Vercel hosting:** Function request/response bodies have a 4.5 MB platform limit. Photo preparation keeps normal image requests below it. The 50 MiB video limit describes the application/storage cap, not a claim that Vercel accepts 50 MiB multipart bodies. Large clips need a separately deployed processing/upload service or a validated private staging flow before production support can be claimed.

**Do not add** an `authenticated`/`anon` INSERT/SELECT/UPDATE/DELETE policy for this bucket on `storage.objects`. Browser clients do not access Storage directly. The actual path is:

1. Browser sends a file to `POST /api/upload` with its authenticated cookie session.
2. `reserve_upload` checks active identity, ownership/conversation access and limits.
3. Server validates actual bytes, strips metadata/re-encodes and optionally scans if a real gateway was configured.
4. Server-only credential writes to the private bucket; `finalize_upload` rechecks access before publishing the media reference.
5. `GET /api/media/[id]` authorizes the current user via `media_access` before using the server credential to return bytes. Posters and video ranges use the same checks and private/no-store headers.

There are no public or signed media URLs in this implementation. Previously downloaded bytes cannot be recalled. Object deletion is asynchronous through the documented retryable cleanup job.

Run these **read-only** checks in the Supabase SQL Editor as the project operator:

```sql
select id, public, file_size_limit, allowed_mime_types
from storage.buckets where id = 'private-media';

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects';

select tablename, rowsecurity
from pg_tables where schemaname = 'public'
order by tablename;
```

If a shared project already has broad object policies, review their predicates: none may grant browser roles access to `private-media`. Policies scoped to other buckets can remain. Do not indiscriminately drop other applications' policies. The migration uses `ON CONFLICT DO NOTHING` for the bucket, so verify the settings of a pre-existing bucket rather than assuming they were changed.

## Realtime

Enable the project's Realtime service and permit WebSocket connections to the configured Supabase origin. The first migration adds exactly **`public.messages`** and **`public.notifications`** to the `supabase_realtime` publication. Do not add them twice; verify after migrations:

```sql
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
  and schemaname = 'public'
  and tablename in ('messages', 'notifications')
order by tablename;
```

Expect both rows. Repair a missing publication entry through the project's publication controls/SQL Editor only if it is missing.

`src/features/app/provider.tsx` subscribes using the signed-in Supabase browser client. It listens to `INSERT` Postgres Changes for messages and the current user's notifications, then fetches a fresh authorized snapshot. Message RLS calls `private.read_conversation`, which checks accepted membership, active accounts, ended conversations and blocks in both directions. Notifications have an owner policy. There is no private-message Broadcast/Presence channel, and `REPLICA IDENTITY FULL` is not needed for the current INSERT-only subscriptions. A 10-second refresh also handles revocation and reconnects; it does not prove that Realtime transport works.

## Auth and exact redirect URLs

Enable **Email/Password**, new user signup and **Confirm email**. Configure a real SMTP provider for hosted delivery to your controlled test inboxes. Keep provider rate limits enabled and sufficient for the test accounts. Set the password minimum to at least 10 characters to match the form. Leave Google disabled until its provider setup is complete.

For local-only review, in Supabase **Authentication → URL Configuration** set:

```text
Site URL:
http://localhost:3000

Redirect URLs:
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=reset
```

For phone review, replace `http://localhost:3000` in **all three places** and `NEXT_PUBLIC_APP_URL` with the environment-assigned HTTPS preview origin. Keep the callback paths exactly as above. A private preview may require signing into the environment on the phone. Do not guess a hostname or broadly allow arbitrary preview domains. Final destinations `/onboarding` and `/reset-password` are internal application redirects, not the Supabase callback entries.

The callback supports PKCE `?code=…` and explicit `token_hash` links. For email links that work when opened in another browser/device, use these exact Supabase email-template link targets after setting Site URL to the canonical browser origin:

**Confirm signup** link:

```html
<a
  href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&amp;type=signup"
  >Confirm your email</a
>
```

**Reset password** link:

```html
<a
  href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&amp;type=recovery"
  >Reset your password</a
>
```

The handler calls `verifyOtp` and sets the session, then routes signup to `/onboarding` and recovery to `/reset-password`. The existing code also requests `${APP_ORIGIN}/auth/callback?next=reset` for recovery. Its PKCE path requires the initiating browser's verifier cookie; the token-hash templates avoid that dependency for email links. Never put email tokens or verification links in chat, logs or screenshots.

If Google is later enabled, its provider-side OAuth authorized redirect is **`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`**. That is distinct from the application's `/auth/callback`; configure the provider secret in Supabase, not browser environment variables.

## Run the real acceptance flow after setup

The live test is separate from the fictional preview suite. It calls real `/api/auth`, `/api/action`, `/api/upload`, `/api/media` and `/api/data` endpoints, uses separate cookie sessions and authenticated Realtime clients, and creates disposable users in your intended project.

Privately create `.env.live.local` (also Git-ignored, mode `600`) with **unused, controlled QA inbox aliases**:

```dotenv
SRITEDU_TEST_EMAIL_A=you+sritedu-qa-a@YOUR_CONTROLLED_DOMAIN
SRITEDU_TEST_EMAIL_B=you+sritedu-qa-b@YOUR_CONTROLLED_DOMAIN
# Recommended: independent unauthorized media/realtime probes.
SRITEDU_TEST_EMAIL_C=you+sritedu-qa-c@YOUR_CONTROLLED_DOMAIN
# Optional when reaching the running app directly inside this environment:
SRITEDU_TEST_BASE_URL=http://localhost:3000
SRITEDU_TEST_EMAIL_WAIT_SECONDS=600
```

These are illustrative addresses, not inboxes to use unchanged. The test requires `sritedu-qa` in each local part, rejects pre-existing accounts and never overwrites them. Passwords are randomly generated only in process memory, with no traces, token files or credential output.

With the configured/rebuilt app running:

```bash
cd /workspace/sritedu
npm run test:live
```

When it prints `WAIT Account A/B/C`, open the real verification email in your own inbox while the test continues. Do not send the link to chat. The default mode waits up to ten minutes per account and verifies actual signup, confirmation, sign-in, profile photo, request/acceptance, two-way text, authenticated Realtime, photo/video/poster/range access, refresh/session persistence and blocking. With C configured, it additionally checks unrelated-account conversation/media/Realtime denial. All this run's new QA users and known QA media paths are cleaned up at the end; unrelated users and global cleanup queues are untouched.

An optional explicit diagnostic mode, `SRITEDU_TEST_CONFIRMATION=admin`, confirms only these disposable users via the admin API. Its report **does not mark email delivery as verified**; it must not be described as a real verification-email test. Default mode uses real mail.

The result is written to `docs/review-2026-10-20/live-verification.json` with step names and statuses only. Missing configuration exits with code `2` and `blocked`, not success. Current result: **blocked before any live signup**, because the required project/application variables and controlled QA inboxes are not configured.

For a manual two-person UI run, use two separate browser profiles: both sign up and verify email, complete onboarding, enable discovery/requests, send and accept a request, exchange text/photos/a short video, refresh both sessions, then block and confirm both sides lose conversation/media access and cannot send again. Also check a signed-out or third account using copied media/conversation URLs. Record Realtime separately from polling; seeing a message after refresh alone is not a Realtime test.

## Current verification boundary

Verified locally: the app is serving on port 3000, `/preview/home` returns 200, desktop/mobile visual review, black/pink styling, screenshots and no horizontal overflow/browser exceptions. Existing preview tests, real local media processing and PostgreSQL RLS tests are documented separately.

Blocked: a phone-accessible environment preview URL is not exposed to this session; real Supabase Auth/SMTP/Storage/Realtime remain unconfigured. No public deployment or external tunnel was used. A local Supabase startup from the earlier session failed during the full Postgres image extraction for Docker disk capacity; that does not count as a working live stack.

Primary references checked: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Supabase SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), and [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes).
