import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSafeRedirectUrl, isAdminPath, DEFAULT_STUDIO_PATH } from "@/lib/auth/safe-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const safeNext = getSafeRedirectUrl(rawNext, DEFAULT_STUDIO_PATH);
  const requiresAdmin = isAdminPath(safeNext);

  if (code && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server component write fallback
            }
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      // If the destination is an admin path, verify the user's role server-side
      if (requiresAdmin) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profile?.role === "admin") {
            return NextResponse.redirect(`${origin}${safeNext}`);
          }

          // Authenticated but non-admin: redirect to login with contextual access denied state
          return NextResponse.redirect(
            `${origin}/login?error=admin_required&next=${encodeURIComponent(safeNext)}`
          );
        }
      }

      // Safe non-admin destination (e.g. Studio)
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Auth exchange failed or missing credentials
  const errorParam = code ? "auth_failed" : "missing_code";
  return NextResponse.redirect(
    `${origin}/login?error=${errorParam}&next=${encodeURIComponent(safeNext)}`
  );
}
