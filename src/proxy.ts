import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicSupabaseKey } from "@/lib/supabase/public-config";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const key = publicSupabaseKey();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) return response;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    key,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(items) {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  await supabase.auth.getUser();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/home/:path*",
    "/communities/:path*",
    "/discover/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/u/:path*",
    "/post/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/api/:path*",
  ],
};
