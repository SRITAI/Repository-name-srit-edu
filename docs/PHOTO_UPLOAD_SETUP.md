# Photo uploads on sritedu

Supabase database/auth configuration and Storage configuration are separate. The
application already has a private, authenticated upload route for profile photos,
post photos and chat attachments.

## 1. Verify the live deployment configuration

In **Vercel → Project → Settings → Environment Variables**, configure these for
**Production** and redeploy. Preview variables do not configure the production domain.

| Variable                               | Value                                                                |
| -------------------------------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Your intended Supabase project's URL                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Its publishable key; a legacy anon key is also accepted              |
| `SUPABASE_SERVICE_ROLE_KEY`            | The same project's server-only secret key or legacy service-role key |
| `NEXT_PUBLIC_APP_URL`                  | `https://sritedu.online`                                             |

Existing setups using `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead of the publishable-key variable are also supported by the browser, server and session proxy. Prefer the publishable-key setting for new projects.

Keep privileged keys private. Do not place the server key in a `NEXT_PUBLIC_`
variable or paste it into chat. The website's account-setup notice means its
production deployment is missing its URL and/or a public-client-key setting;
it does not prove that your Supabase project itself was not created or connected elsewhere.

## 2. Verify the application migrations and Storage bucket

Apply the five tracked migrations in their recorded order through `supabase db push`,
as described in [the complete setup guide](SUPABASE_SETUP.md). A bucket alone does
not create the post tables or the upload authorization functions.

In **Supabase → Storage**, the bucket should have these settings:

| Setting         | Value                                   |
| --------------- | --------------------------------------- |
| Name / ID       | `private-media`                         |
| Public          | Off — private                           |
| File size limit | `52428800` bytes (50 MiB storage cap)   |
| MIME types      | `image/webp`, `video/mp4`, `video/webm` |

JPEG/PNG/WebP are accepted as photo inputs. The browser prepares photos and the
server re-encodes them to WebP before Storage receives them, so this bucket does
not need raw JPEG/PNG MIME types. Preserve the existing server-only Storage flow;
do not make the bucket public or add broad browser object policies.

These SQL queries only inspect readiness:

```sql
select id, public, file_size_limit, allowed_mime_types
from storage.buckets where id = 'private-media';

select to_regclass('public.posts') as posts_table,
       to_regclass('public.media') as media_table,
       to_regprocedure('public.reserve_upload(text,uuid,text)') as upload_authorization;
```

## 3. Upload from the website

Sign in → Share post (+) → Add photos / video → choose a photo → choose its
community/audience → Share your story. Profile and chat photos use the same
private server upload path.

Photo inputs are limited to 10 MiB and 40 megapixels. The browser reduces the
long edge to at most 2048 px and targets a file no larger than 3 MiB. The server
still checks file contents, strips metadata and checks access before publishing.
This avoids sending large camera photos directly into Vercel's 4.5 MB request limit.
Videos have separate hosting/processing requirements; a 50 MiB bucket cap does not
remove that Vercel limit or supply FFmpeg.

## 4. Email confirmation and redirects

In Supabase Auth, use Site URL `https://sritedu.online` and allow:

- `https://sritedu.online/auth/callback`
- `https://sritedu.online/auth/callback?next=reset`

Configure email delivery/SMTP for confirmation and password reset. Enable Google
only after configuring the real provider; the UI does not show inactive social
login buttons. `GOOGLE_AUTH_ENABLED=true` is the application flag for that provider.

## References

- [Supabase bucket creation and restrictions](https://supabase.com/docs/guides/storage/buckets/creating-buckets)
- [Vercel function body limits](https://vercel.com/docs/functions/limitations#request-body-size)

A passing preview or mocked-auth test does not establish that real signup, email
delivery, private Storage or Realtime is configured. Verify those with a controlled
real account after the deployment settings are complete.
