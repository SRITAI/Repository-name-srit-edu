# Repository replacement validation

Validated on 2026-10-20 for `SRITAI/Repository-name-srit-edu`, branch `main`.

## Source and history

The original remote main was `d0f3550a06f1f6d9d680b5fbaf8c367810420e1e` (`Fix Supabase cookie handling in server client`). The existing `backup/pre-sritedu-community-20261020` branch was verified to point to that same commit. The replacement was prepared in an isolated full-history clone of main. The backup branch was not modified.

The completed community application was copied from `/workspace/sritedu`: 108 source, test, migration, configuration, documentation and screenshot files were matched against the export's SHA-256 manifest. The original working application directory was not modified. The only additions to that completed source are this report and repository-transition notes in README/setup documentation; no design or application behavior changes were made.

The old education application was removed, including its root `app/`, `components/`, `lib/`, old middleware/configuration, logo, education migrations and seed data. Sixty-five obsolete tracked files were removed. The new application uses `src/app/`, its own dependencies and lockfile, and only its five dated community migrations. Both applications are not combined.

## Checks run in the isolated checkout

After a clean `npm ci --include=dev --no-audit --no-fund` using Node 24.19.0 and npm 11.9.0:

| Check               | Result                                  |
| ------------------- | --------------------------------------- |
| `npm run typecheck` | Passed                                  |
| `npm run lint`      | Passed, no errors or warnings           |
| `npm run build`     | Passed, Next.js 16.4.2 production build |
| `git diff --check`  | Passed                                  |

No blocking source changes were needed. The production build ran without live Supabase configuration. A successful build does not verify provider services.

The earlier media, PostgreSQL and preview browser results remain documented in [VERIFICATION.md](VERIFICATION.md) and the [desktop/mobile review](review-2026-10-20/README.md); those suites were not rerun for this source-only repository replacement.

## Included and excluded files

Included: application source, package lockfile, tests, operator scripts, public assets, `.env.example`, all five Supabase migrations, setup guides, verification reports and retained fictional desktop/mobile screenshots.

Excluded: real environment files, credentials, tokens, dependency directories, `.next` output, Supabase project-link metadata, logs, browser auth state, Playwright reports/traces and generated test-session data. Generated files from validation remain ignored locally and are not part of the commit.

## External setup still required

No live database migrations were run, and no website deployment was performed as part of this repository replacement.

Use a new, empty Supabase project: these migrations are not an upgrade path for the old education database. Configure project/application variables privately, then follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for migration order, private Storage policies, Realtime publication, SMTP/email confirmation and exact authentication redirect URLs. Rebuild after configuring public variables. Install FFmpeg/FFprobe on the application host.

Real signup/email delivery, Storage HTTP, Realtime transport and the live two-account connection/text/photo/video/persistence/blocking flow remain unverified until this configuration is available. The separate `npm run test:live` command uses privately configured disposable QA inbox aliases and reports missing configuration as blocked. Preview results never count as live-account verification.
