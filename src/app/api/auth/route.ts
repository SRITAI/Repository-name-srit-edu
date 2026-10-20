import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { configured, serverClient } from "@/lib/supabase/server";
import { authSchema } from "@/lib/schema";
import { sameOrigin } from "../action/route";
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Request origin rejected." },
      { status: 403 },
    );
  if (!configured())
    return NextResponse.json(
      {
        error:
          "Live accounts aren’t configured yet. Explore the fictional preview, or connect Supabase using the README.",
      },
      { status: 503 },
    );
  try {
    const p = await req.json();
    const db = await serverClient();
    const base = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    if (p.kind === "sign-out") {
      await db.auth.signOut();
      return NextResponse.json({ next: "/" });
    }
    if (p.kind === "forgot-password") {
      const email = z.email().parse(p.email);
      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: base + "/auth/callback?next=reset",
      });
      if (error) throw error;
      return NextResponse.json({
        message:
          "If that address has an account, a reset link is on its way. Check your inbox.",
      });
    }
    if (p.kind === "reset-password") {
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) throw new Error("Open your password-reset email first.");
      const password = z.string().min(10).max(128).parse(p.password);
      const { error } = await db.auth.updateUser({ password });
      if (error) throw error;
      return NextResponse.json({ next: "/home" });
    }
    if (p.kind === "google") {
      if (process.env.GOOGLE_AUTH_ENABLED !== "true")
        throw new Error("Google sign-in is not configured.");
      const { data, error } = await db.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: base + "/auth/callback" },
      });
      if (error) throw error;
      return NextResponse.json({ next: data.url });
    }
    const fields = authSchema.parse(p);
    if (p.kind === "sign-up") {
      if (!fields.adult) throw new Error("sritedu is for adults 18 and older.");
      const { data, error } = await db.auth.signUp({
        email: fields.email,
        password: fields.password,
        options: {
          emailRedirectTo: base + "/auth/callback",
          data: { adult_declared: true },
        },
      });
      if (error) throw error;
      return NextResponse.json(
        data.session
          ? { next: "/onboarding" }
          : {
              message:
                "Check your email to confirm your account, then choose your community.",
            },
      );
    }
    if (p.kind !== "sign-in")
      throw new Error("Unsupported authentication action.");
    const { error } = await db.auth.signInWithPassword({
      email: fields.email,
      password: fields.password,
    });
    if (error) throw error;
    return NextResponse.json({ next: "/home" });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof z.ZodError
            ? e.issues[0].message
            : e instanceof Error
              ? e.message
              : "Unable to sign in.",
      },
      { status: 400 },
    );
  }
}
