# Verification record

Run in `/workspace/sritedu` on 2026-10-20. This is an implemented prelaunch application, not a claim of production readiness. No site was publicly deployed and no paid service was provisioned.

## Completed checks

| Check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed, TypeScript strict mode |
| `npm run lint` | Passed, no errors or warnings |
| `npm run build` | Passed, Next.js 16.4.2 production build |
| `npm test` | 6 real media-processing tests passed |
| `npm run test:security` | 22 PostgreSQL integration/authorization checks passed |
| `npm run test:e2e` | 11 Playwright browser tests passed against the production server |

The media suite decodes a real JPEG, verifies stripped EXIF/XMP and bounded WebP output, rejects disguised SVG/HTML/executable content and oversized bytes, and transcodes an actual generated short MP4 with a metadata-free poster through FFmpeg/Sharp.

The database suite applies all five actual migration files to a fresh PGlite PostgreSQL database. It uses three separate identities under the `authenticated` role, not application-only mocked permission decisions. It covers:

- Owner-only settings, topics, memberships, and bookmarks.
- Direct-write denial and role/privilege escalation denial.
- Community, connection-only, and private-draft audience checks.
- Reactions, comments and one level of replies.
- Discovery topic disclosure and opt-out.
- Mutual acceptance before chat/media authorization.
- Text-message persistence after closing and reopening the database.
- Upload tickets, inaccessible unfinished media, finalization and request-time media authorization.
- Optional read-receipt disclosure.
- Narrow reported evidence access and audit records, without blanket private-message access.
- Both-direction blocks, suspension, and denied writes after access is revoked.
- Suspended-owner appeals, administrator-only restoration, and reported-content removal.
- Profile-photo revocation and cleanup when choosing a non-photo avatar.
- Image/video/poster deletion jobs, rate limits, and RLS on every exposed application table.

The browser suite uses **fictional preview data**, clearly labelled in the UI. It verifies story photo publishing, reactions, comments, bookmarks, drafts, journey updates, request acceptance, text/photo/video messages, refresh persistence, actual preview video readiness, mute controls, upload rejection, report submission, profile photo cropping and username changes, topic privacy controls, keyboard focus trapping, Escape dismissal, and in-app reduced-motion persistence.

Eight representative routes were checked for horizontal overflow at **360, 390, 768, and 1440 px**. Automated axe checks passed for WCAG A/AA rules on the landing page, home feed, sign-up, Help & Support, settings, and messages. Browser/device reduced-motion behavior was checked. These automated checks do not replace manual screen-reader and real-device testing.

## External checks not completed

No Supabase project credentials were available. A local Supabase startup was attempted; the full Postgres Docker image failed during extraction with `no space left on device`. Some registry attempts were also rate-limited. The application therefore remains unconnected to a live Supabase service in this workspace.

Consequently, these flows are implemented but **not verified through a live provider**:

- Two real accounts signing up, receiving verification/recovery emails, authenticating, and retaining live cookie sessions.
- Supabase Storage HTTP upload/download/range responses and deletion jobs against actual stored objects.
- Authenticated Realtime transport, reconnect/token refresh, unread updates, and blocked/suspended third-account event denial over a live WebSocket.
- The full two-person text/photo/video flow across separate live browser accounts, followed by third-account HTTP/API/storage/realtime probes.
- Hosted Google OAuth, SMTP delivery, optional scanning gateway, a deployed cleanup scheduler, and production reverse-proxy limits.

PGlite validates PostgreSQL migrations, RLS, grants, constraints, and RPC behavior. It does **not** stand in for Supabase Auth, Storage, email, PostgREST transport, or Realtime transport. The isolated preview is not production authentication or a backend substitute.

## Remaining setup and launch gates

Follow [README.md](../README.md) for environment variables, migration order, Storage/Realtime/Auth setup, trusted initial-admin creation, cleanup commands, and local/hosted commands. Install FFmpeg/FFprobe on the application host. Use a Node host that supports the documented upload limits and processing duration.

Before public launch, run the missing live three-account acceptance flow, assign actual moderators and coverage, publish a real support contact, configure cleanup and backup retention, and have the owner review the draft policies. Optional per-post anonymous author hiding, typing/presence, journals, mood check-ins, and end-to-end encryption are not implemented or advertised.
