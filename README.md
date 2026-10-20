# sritedu

A black-and-pink peer-support community for adults 18+. Built in this workspace with Next.js App Router, TypeScript, Tailwind tokens, Motion, Radix Dialog, Lucide, Zod, and Supabase Auth/PostgreSQL/Storage/Realtime. No public deployment or paid service was created.

Visual review: [landing](docs/screenshots/landing-desktop.png), [home feed](docs/screenshots/home-desktop.png), [mobile home](docs/screenshots/home-mobile.png), and [mobile conversation](docs/screenshots/messages-mobile.png). All pictured content is fictional.

Latest continuation: [desktop/mobile screenshots and current verification](docs/review-2026-10-20/README.md). Follow the [exact Supabase setup guide](docs/SUPABASE_SETUP.md) for secure configuration, migration order, bucket policies, Realtime and email callback URLs. No phone-accessible preview URL has been exposed to this session.

Repository replacement: [validation and remaining setup](docs/REPOSITORY_REPLACEMENT.md). This community application replaces the former education website. Use a fresh Supabase project for its schema; the former education database is not migrated by a source-code push.

## Run the isolated preview

Requires Node 24+ and npm. FFmpeg and FFprobe are required for live video processing and media tests.

```bash
cd /workspace/sritedu
npm ci
npm run dev
```

Open **http://localhost:3000**. “Explore sritedu” opens **/preview/home**. The preview is labelled on every application screen. Its people, stories, requests, messages, and moderation cases are fictional. Changes are saved only in `sessionStorage` for that browser tab/session; large preview media may exceed browser storage. Preview data never enters Supabase and is never used as a fallback for live failures. Close the session or clear its session storage to reset it. Set `NEXT_PUBLIC_ENABLE_PREVIEW=false` to disable preview routes.

## Configure the real backend

Use a Supabase project you control, or run the local stack below. Copy `.env.example` to `.env.local` and set:

| Variable                               | Purpose                                                                                                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Your Supabase HTTPS API URL, or local `http://127.0.0.1:54321`                                                                                                                                    |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (local legacy anon key also works)                                                                                                                                       |
| `SUPABASE_SERVICE_ROLE_KEY`            | **Server/operator only.** Same project's secret key (`sb_secret_…`) or existing legacy `service_role` JWT. Media storage, account operations and initial roles. Never prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_APP_URL`                  | Canonical browser origin, e.g. `https://community.example.com`; needed for callbacks and request-origin validation                                                                                |
| `GOOGLE_AUTH_ENABLED`                  | `false` unless the Google provider and credentials are configured in Supabase                                                                                                                     |
| `NEXT_PUBLIC_ENABLE_PREVIEW`           | Explicit fictional preview, `true` or `false`                                                                                                                                                     |
| `MAX_IMAGE_MB`, `MAX_VIDEO_MB`         | Defaults 10 and 50. Video hard cap is 50 MB; align bucket limits if lowering them.                                                                                                                |
| `MEDIA_SCAN_URL`, `MEDIA_SCAN_TOKEN`   | Optional scanning gateway. Receives raw bytes by authenticated HTTP POST and must return `{ "clean": true }`. A configured scanner fails closed. No scanner is claimed when absent.               |

Apply migrations in filename order using the Supabase CLI, **only against the intended project**:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Migrations:

1. `202610200001_core.sql`: tables, checks, indexes, RLS, write RPCs, initial private bucket, realtime publication.
2. `202610200002_communities.sql`: the ten editable communities. No fabricated members or activity.
3. `202610200003_media_operations.sql`: upload tickets, finalization, media access, audited evidence, cleanup and role RPCs.
4. `202610200004_evidence_grants.sql`: evidence column access restricted to audited review RPC.
5. `202610200005_operations.sql`: aggregate metrics, appeals, account restoration, reported-content removal.

These are fresh-install migrations. Do not re-run individual files against an existing installation. CLI migration history owns upgrades.

### Local Supabase

Docker needs enough free space for the full Supabase Postgres image and its extraction; this environment could not complete that image pull. `supabase/config.toml` is included, with local email confirmations enabled and Mailpit available at http://localhost:54324.

```bash
npm run db:start
npx supabase db reset
npx supabase status -o env | node scripts/local-env.mjs
npm run dev
```

`db:reset` destroys **local** database contents. Use it only for your isolated development stack. The environment helper accepts modern and legacy CLI keys, creates ignored `.env.local` with owner-only permissions without printing keys, and refuses to overwrite existing configuration. Restart Next.js after changing public environment variables; rebuild before using `next start`. Do not commit `.env.local`.

### Authentication / storage / realtime setup

- Enable email/password authentication, **email confirmation**, and a real SMTP provider for hosted use. Set Site URL to the canonical origin; allow `${origin}/auth/callback` and `${origin}/auth/callback?next=reset`. The callback also accepts Supabase token-hash links. Do not point recovery emails directly at the password form.
- For Google, configure the provider in Supabase before setting `GOOGLE_AUTH_ENABLED=true`; the button stays absent otherwise.
- Migrations create a **private** `private-media` bucket. There are deliberately no client storage-object policies. Clients cannot upload/download objects directly. Server routes authorize with the member session, then use the server credential to transfer bytes. No public URLs or signed media links are issued.
- Migrations add `messages` and `notifications` to `supabase_realtime`. Enable Realtime for the project. Postgres Changes subscriptions use the signed-in client token and table RLS. No private message body is copied to broadcast channels. Each insert is reauthorized; 10-second refresh and API reads handle access revocation in existing screens. Previously received bytes cannot be recalled.
- Use HTTPS in hosted environments. Configure a reverse proxy/body limit allowing 53 MB and request duration of at least 120 seconds for video processing. Serverless platforms with smaller request limits need an adapted quarantined direct-upload pipeline; do not deploy this upload route there unchanged.
- The supplied CSP permits the configured Supabase origin and matching WebSocket origin, plus local Supabase in development. Production does not allow `unsafe-eval`. Inline scripts/styles are currently required by Next/Motion; a nonce-based stricter policy is an operator hardening option.

## What works

- Public landing page, ten community spaces, how-it-works, care principles, Help & Support, and owner-review policy drafts.
- Real email auth, verification callback, password recovery, sign-out, persisted cookie sessions, route protection, and four-stage onboarding with pseudonyms, unique usernames, centre-cropped photo/non-photo avatars, languages, intents, communities, consent, and private preferences.
- Community join/leave; text, multi-photo, short-video stories; private drafts; edits/deletion; journey updates and chronological profile timeline; warnings; author-controlled comments and hidden reaction counts; supportive reactions, comments/one-level replies, bookmarks, audiences, feed filters and pagination.
- Explicit opt-in people matching using permitted topics/languages; reason labels, filters, dismissal, text-only requests, accept/decline/cancel, accepted connections.
- Persistent chat; authorized realtime refresh; photos/videos/captions; progress/retry; earlier messages; reply-to-message; supportive message reactions; sent/read indicators with optional receipts; generic notifications; mute/archive/block/end controls; full-screen media viewer.
- Profile editing, privacy/discovery controls, UTC quiet hours, reduced motion, topic muting, blocking, account export/deactivation/deletion, reports and appeals.
- Moderator queue, audited evidence access, post/comment/message/media removal, administrator suspension/account restoration, community editing, verified resource entry, audit log, and aggregate service metrics.

Optional per-post anonymous author hiding, presence/typing, private journaling, mood check-ins, PWA/offline private data caching, automated AI moderation, and E2E encryption are intentionally not implemented or advertised. Pseudonyms are supported. The offline state explains reconnection; it does not silently queue sensitive writes.

## Authorization and privacy model

Every application table exposed through the public API has RLS. Private settings, topic choices, discovery preferences, memberships, dismissals, blocks, and bookmarks have owner policies. Directory profiles contain only basic fields. Private helpers use a fixed empty search path and are not in the exposed API schemas. Authenticated users have **no direct writes** to tables; narrow RPCs enforce identity, active-account checks, audience checks, ownership, limits, and mutual acceptance. API Zod validation is additional validation, not the authorization boundary.

Community posts require membership; connections-only posts require an accepted connection; drafts require ownership. Both-direction blocks are checked for profile/feed/discovery/request/chat/media access. Suspensions and deactivation disable access. Read receipts reveal another member’s timestamp only when that member opted in. Discovery returns only explicitly shared topic arrays; turning topic sharing off clears the matching array. Joining a community never publishes a membership list.

Media magic bytes are checked, image decoding is pixel-limited, images are oriented/re-encoded to WebP without metadata, and videos (up to 90 seconds) are decoded/re-encoded to MP4 with a metadata-free WebP poster. Video tools are protocol-limited and timed out. Raw files exist only in a temporary server directory and are removed in `finally`. Validated storage objects remain unreferenced and inaccessible until finalization rechecks ownership/access. Every byte-serving request rechecks authorization and sends private/no-store headers, including byte-range/video poster requests. Downloaded or displayed files cannot be recalled.

Moderator access is limited to reported snapshots and media attached to the reported item. Queue queries cannot read the evidence column directly. Opening text evidence or a reported media object creates an audit record. Moderators do not get a general private-conversation browser. There is no AI moderation provider. The optional malware scanner receives raw uploaded bytes; document its provider and retention before enabling it.

## Operator tasks before public launch

Assign real moderation staff, coverage, escalation contact, and appeals ownership. No 24/7 monitoring or response times are promised. Fill in the legal operator, support contact, hosting region, backup retention, and owner-reviewed policies. Current resource links were checked on 2026-10-20; verify region-specific details again before launch. No phone numbers are copied into the app.

Create the initial administrator without a hardcoded password:

```bash
# Sign up normally, confirm email, and complete onboarding first.
node --env-file=.env.local --import tsx scripts/admin.ts owner@example.com admin
# The same trusted operator command grants/revokes roles and records an audit event:
node --env-file=.env.local --import tsx scripts/admin.ts reviewer@example.com moderator
node --env-file=.env.local --import tsx scripts/admin.ts reviewer@example.com member
```

Run the retryable cleanup job at least hourly from a trusted scheduler with server-only environment values:

```bash
node --env-file=.env.local --import tsx scripts/cleanup.ts
```

Each run handles up to 100 objects; repeat while `morePossible` is true. Failures increment a retry counter and remain queued. Abandoned tickets are collected after an hour; resolved/dismissed report text evidence expires after 90 days. Open reports remain for human review. Configure backups and monitoring separately. The command does not claim that scheduling or an antivirus service already exists.

## Checks and verification limits

```bash
npm run typecheck
npm run lint
npm test
npm run test:security
npm run build
npm run start
# In another terminal, with Chromium installed:
npm run test:e2e
```

Security tests apply the actual migrations to **PGlite’s PostgreSQL engine**, create three independent database identities, change to the authenticated role, and exercise RLS and actual RPCs. They also close/reopen the database to check message persistence. They are not a substitute for Supabase Auth, HTTP Storage, email delivery, or Realtime transport tests.

Media tests process real images and a generated MP4 through Sharp/FFmpeg, inspect metadata, and reject disguised and oversized content. Playwright tests exercise the explicitly fictional browser preview, responsive routes, dialogs/keyboard interaction, settings, requests, media posts and chat persistence. See `docs/VERIFICATION.md` for the actual run results and external gaps.

After private backend configuration and a rebuild/restart, `npm run test:live` runs the separate real-account acceptance flow. Configure controlled disposable QA inbox aliases privately as described in [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). It waits for actual email confirmation, then exercises requests, authenticated Realtime, text/photo/video persistence and blocking. Missing configuration exits with `blocked`; preview results never count as live results. `npm run review:screenshots` refreshes the explicitly fictional desktop/mobile captures.

## Hosted build commands (no deployment performed)

On a Node host with FFmpeg/FFprobe, set the environment variables before building:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run test:security
npm run build
NODE_ENV=production npm run start
```

Alternatively use the Dockerfile on an appropriately configured build host. It includes FFmpeg. Public Supabase values are build arguments; the service-role key and scan token must be supplied only as runtime secrets. Follow your build environment’s proxy and CA guidance for networked Docker builds. A successful build does not establish production readiness; provider setup, live three-user acceptance, operator review, and staffed moderation remain required.

Official implementation references: [Next.js authentication](https://nextjs.org/docs/app/guides/authentication), [Supabase SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs), [authorized Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes). Support directory sources: [Worldwide](https://findahelpline.com/) and [India](https://findahelpline.com/countries/in).
