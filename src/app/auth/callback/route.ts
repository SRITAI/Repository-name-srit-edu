import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server";
export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const db = await serverClient();
  const code = req.nextUrl.searchParams.get("code");
  const token_hash = req.nextUrl.searchParams.get("token_hash");
  const type = req.nextUrl.searchParams.get("type");
  const result = code
    ? await db.auth.exchangeCodeForSession(code)
    : token_hash && ["signup", "recovery", "email"].includes(type || "")
      ? await db.auth.verifyOtp({
          token_hash,
          type: type as "signup" | "recovery" | "email",
        })
      : { error: new Error("Missing verification link") };
  if (result.error)
    return NextResponse.redirect(new URL("/sign-in?error=verification", base));
  return NextResponse.redirect(
    new URL(
      type === "recovery" || req.nextUrl.searchParams.get("next") === "reset"
        ? "/reset-password"
        : "/onboarding",
      base,
    ),
  );
}
