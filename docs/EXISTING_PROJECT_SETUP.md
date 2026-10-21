# Existing Supabase project installation — 2026-10-21

The community app was installed in the existing Supabase project `phjtyfqmswarbeuuybnl`. No new project was created.

## Data and access preserved

- Community profiles use `public.community_profiles`; legacy `public.profiles` remains intact.
- Existing Auth identities continue to use the same login. Community onboarding and consent are required before participation. Education roles do not confer community staff roles.
- Before/after checksums match for all 52 legacy profiles, 8 courses, 37 orders and 15 payments.
- Legacy public function definitions/ACLs and RLS policies have matching checksums.
- The existing Auth signup trigger and bucket-scoped employee Storage policies remain intact.
- Account export reads community data. Community deletion removes community content, queues media cleanup and signs out the current session; shared Auth and education records remain.

## Installation and verification

The five migration filenames match the versions actually recorded by Supabase MCP:
- `20261021025058_core.sql`
- `20261021025118_communities.sql`
- `20261021025155_media_operations.sql`
- `20261021025203_evidence_grants.sql`
- `20261021030132_operations.sql`

All 23 new public application tables have RLS. The private `private-media` bucket has the documented 50 MiB storage cap and stored MIME types. Both `public.messages` and `public.notifications` belong to `supabase_realtime`.

Live PostgreSQL assertions passed for three transient identities inside a transaction: consent/onboarding, community audience isolation, connection acceptance, chat, private media authorization, third-account denial, blocking, and community-only deletion. All test writes were rolled back; zero QA accounts/posts/messages remain. No emails or Storage bytes were sent by this database test.

Local validation: production build/TypeScript and lint passed; 9 unit tests, 36 browser tests, 25 shared-project SQL/security checks and 23 empty-project SQL/security checks passed. Browser auth tests are mocked and browser media tests use the labelled fictional preview. The local full Docker stack was not started.

## Remaining production checks

The Vercel project is `repository-name-srit-edu-y5zm` (`prj_7yy9Z1166Wo6VI5eWX4tryFunGy0`) in team `srit4` (`team_EnpPqsVqlLyKFV9PaTMdBWiB`). The connected Vercel plugin returns 403 `grant_team_access` for this team; no authenticated CLI fallback is available. Reauthorize the plugin for that team to inspect Production variable metadata and verify the server-only media credential. Secret values must stay in private settings.

The public Supabase Auth settings endpoint reports email signup enabled, automatic email confirmation enabled, and Google disabled. Redirect allowlists, SMTP and password recovery have not been inspected or changed. The live acceptance script now blocks the email-delivery claim when automatic confirmation is enabled; explicit admin diagnostic mode also keeps SMTP unverified.

Real browser signup/sign-in, live photo byte upload/download, SMTP/password-reset mail and Realtime WebSocket delivery are not claimed as tested. A SQL publication check does not prove WebSocket transport. Vercel's HTTP body limits and missing FFmpeg still require a separate validated solution for large videos.

## Advisor review

No anonymous grants were added to community RPCs. Authenticated community RPCs intentionally enforce identity, ownership, active status, audience, roles and blocks; service-only RPCs retain service-only grants. The advisor flags their deliberate SECURITY DEFINER access for [review](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable); live/local tests exercise those authorization boundaries.

Existing education notices remain: [five mutable search paths](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [three anonymous executable trigger functions](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), and [disabled leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). These pre-existing settings were left unchanged to preserve the education system's behavior.

See [structured verification](existing-project-verification.json), [complete setup](SUPABASE_SETUP.md) and [photo requirements](PHOTO_UPLOAD_SETUP.md).
