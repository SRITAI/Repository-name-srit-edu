"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSafeRedirectUrl, isAdminPath, DEFAULT_STUDIO_PATH } from "@/lib/auth/safe-redirect";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawNext = searchParams.get("next");
  const rawError = searchParams.get("error");
  const safeNext = getSafeRedirectUrl(rawNext, DEFAULT_STUDIO_PATH);
  const isAdminContext = isAdminPath(safeNext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Access Denied State (when user credentials are valid but role != 'admin')
  const [accessDeniedState, setAccessDeniedState] = useState<{
    isDenied: boolean;
    email?: string;
    role?: string;
  }>({
    isDenied: false,
  });

  // Password Reset State
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Detect OAuth access-denied or admin-required error parameter on mount
  useEffect(() => {
    if (rawError === "admin_required" || (isAdminContext && rawError === "access_denied")) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();
            setAccessDeniedState({
              isDenied: true,
              email: user.email || undefined,
              role: profile?.role || "client",
            });
          } else {
            setAccessDeniedState({
              isDenied: true,
              email: undefined,
              role: undefined,
            });
          }
        });
      } else {
        setAccessDeniedState({
          isDenied: true,
          email: undefined,
          role: "client",
        });
      }
    } else if (rawError === "auth_failed") {
      setAuthError("Authentication could not be completed. Please try signing in again.");
    }
  }, [rawError, isAdminContext]);

  // Handle standard email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      if (isAdminContext) {
        setAuthError(
          "Supabase authentication is not configured in this environment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to sign in with an administrator account."
        );
        setLoading(false);
        return;
      }
      // Demo / fallback preview for studio
      setTimeout(() => {
        router.push(safeNext);
      }, 500);
      return;
    }

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setAuthError(signInError.message);
      setLoading(false);
      return;
    }

    // Server-side role check for admin context:
    if (isAdminContext && authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push(safeNext);
        router.refresh();
        return;
      }

      // User signed in successfully but is not an admin: show clear Access Denied UI
      setAccessDeniedState({
        isDenied: true,
        email: authData.user.email,
        role: profile?.role || "client",
      });
      setLoading(false);
      return;
    }

    // Normal studio destination
    router.push(safeNext);
    router.refresh();
  };

  // Handle Google OAuth login preserving safe destination
  const handleGoogleLogin = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      if (isAdminContext) {
        setAuthError(
          "Supabase authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable Google OAuth."
        );
        return;
      }
      router.push(safeNext);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });

    if (error) {
      setAuthError(error.message);
    }
  };

  // Handle password reset preserving return destination
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetStatus(null);

    const supabase = getSupabaseBrowserClient();
    const targetEmail = (resetEmail || email).trim();

    if (!supabase) {
      setResetStatus({
        type: "error",
        message:
          "Supabase authentication is not configured. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your local environment.",
      });
      setResetLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
    });

    if (error) {
      setResetStatus({
        type: "error",
        message: error.message,
      });
    } else {
      setResetStatus({
        type: "success",
        message: `Password reset instructions sent to ${targetEmail}. Please check your inbox to update your password.`,
      });
    }
    setResetLoading(false);
  };

  // Sign out and return to clean login form
  const handleSignOutAndRetry = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAccessDeniedState({ isDenied: false });
    setPassword("");
    setAuthError(null);
    router.replace(`/login?next=${encodeURIComponent(safeNext)}`);
  };

  const isSupabaseConfigured = Boolean(getSupabaseBrowserClient());

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 flex items-center justify-center font-sans antialiased relative">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-bold tracking-tight text-white mb-3 hover:text-white/80 transition-colors"
          >
            infimindss<span className="text-xs align-super opacity-70">°</span>
          </Link>

          {isAdminContext ? (
            <>
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-lime-300 bg-lime-950/60 border border-lime-500/30 px-3.5 py-1 rounded-full w-fit mx-auto mb-3 shadow-[0_0_12px_rgba(215,255,61,0.15)]">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                <span>Admin Portal · Ad Explorer</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
                Admin <span className="italic font-normal text-neutral-200">sign in</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-2 max-w-xs mx-auto leading-relaxed">
                Sign in with an approved administrator account to manage Ad Explorer listings.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1 rounded-full w-fit mx-auto mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Human + AI Studio</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
                Welcome back to <br />
                <span className="italic font-normal text-neutral-200">your creator chamber.</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-2 max-w-xs mx-auto leading-relaxed">
                Sign in to track your brief, review edits, or submit new campaigns.
              </p>
            </>
          )}
        </div>

        {/* Local Configuration Notice (Environment Variable Guidance Only) */}
        {!isSupabaseConfigured && isAdminContext && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300 block">Configuration Notice:</span>
              Supabase environment variables (<code className="font-mono text-white">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="font-mono text-white">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) are not configured in this environment.
              Set them in your local <code className="font-mono text-white">.env.local</code> to authenticate admin accounts.
            </div>
          </div>
        )}

        {/* Cream Sign-In Panel */}
        <div className="bg-[#FAF9F6] text-[#111111] rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/[0.08]">
          {/* STATE 1: ACCESS DENIED (Authenticated but Non-Admin) */}
          {accessDeniedState.isDenied ? (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/70 border border-amber-300/80 flex items-center justify-center mx-auto text-amber-800">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                  Access Denied · 403
                </span>
                <h2 className="text-2xl font-serif text-[#111111]">
                  Administrator Role Required
                </h2>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  {accessDeniedState.email ? (
                    <>
                      You are signed in as{" "}
                      <strong className="text-[#111111] font-mono font-semibold">
                        {accessDeniedState.email}
                      </strong>{" "}
                      with role{" "}
                      <span className="text-amber-800 font-mono font-semibold">
                        &lsquo;{accessDeniedState.role || "client"}&rsquo;
                      </span>
                      .
                    </>
                  ) : (
                    "Your current session does not have administrator privileges."
                  )}
                  <br />
                  Managing Ad Explorer listings requires an account promoted to the administrator role.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  href="/"
                  className="w-full py-2.5 px-4 rounded-full bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 transition-colors text-center"
                >
                  Return to Site
                </Link>
                <Link
                  href="/studio/projects"
                  className="w-full py-2.5 px-4 rounded-full bg-white border border-black/10 text-xs font-medium text-[#111111] hover:bg-neutral-50 transition-colors text-center"
                >
                  Go to Creator Studio
                </Link>
                <button
                  type="button"
                  onClick={handleSignOutAndRetry}
                  className="text-xs text-[#6B6B6B] hover:text-[#111111] underline pt-1 transition-colors"
                >
                  Sign out &amp; switch account
                </button>
              </div>
            </div>
          ) : isResettingPassword ? (
            /* STATE 2: PASSWORD RESET MODE */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <h2 className="text-base font-semibold text-[#111111]">
                  Reset your password
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setResetStatus(null);
                  }}
                  className="text-xs text-[#6B6B6B] hover:text-[#111111] flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to sign in</span>
                </button>
              </div>

              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Enter your registered work email. We will send a secure password reset link preserving your destination to{" "}
                <span className="font-mono font-semibold text-[#111111]">
                  {isAdminContext ? "Ad Explorer Admin" : "Studio"}
                </span>
                .
              </p>

              {resetStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    resetStatus.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {resetStatus.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{resetStatus.message}</span>
                </div>
              )}

              {resetStatus?.type !== "success" ? (
                <form onSubmit={handlePasswordReset} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#6B6B6B]" />
                      <input
                        type="email"
                        required
                        value={resetEmail || email}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="alex@yourbrand.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/10 focus:border-black focus:outline-none text-xs text-[#111111] bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-2.5 px-6 rounded-full bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{resetLoading ? "Sending Link..." : "Send Reset Link"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setResetStatus(null);
                  }}
                  className="w-full py-2.5 px-6 rounded-full bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 transition-colors mt-2"
                >
                  Return to sign in
                </button>
              )}
            </div>
          ) : (
            /* STATE 3: STANDARD / CONTEXTUAL SIGN IN */
            <>
              {authError && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border border-black/10 hover:border-black/25 bg-white text-xs font-medium text-[#111111] transition-all hover:bg-neutral-50 mb-4"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/[0.08]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                  <span className="bg-[#FAF9F6] px-3 text-[#6B6B6B]">
                    {isAdminContext ? "Or with admin credentials" : "Or with email"}
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                    {isAdminContext ? "Administrator Email" : "Work or Brand Email"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#6B6B6B]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isAdminContext ? "admin@infimindss.com" : "alex@yourbrand.com"}
                      className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/10 focus:border-black focus:outline-none text-xs text-[#111111] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#111111]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsResettingPassword(true);
                        setResetEmail(email);
                        setResetStatus(null);
                      }}
                      className="text-[11px] text-[#6B6B6B] hover:text-[#111111] font-medium transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#6B6B6B]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/10 focus:border-black focus:outline-none text-xs text-[#111111] bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-6 rounded-full bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <span>
                    {loading
                      ? "Signing in..."
                      : isAdminContext
                      ? "Sign in to Admin"
                      : "Sign in to Studio"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Conditional Footer Navigation */}
              {isAdminContext ? (
                <div className="mt-5 pt-5 border-t border-black/[0.06] text-center">
                  <p className="text-xs text-[#6B6B6B]">
                    Looking for creator workspace?{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-[#111111] underline hover:no-underline"
                    >
                      Studio Sign in
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="mt-5 pt-5 border-t border-black/[0.06] text-center">
                  <p className="text-xs text-[#6B6B6B]">
                    New to infimindss?{" "}
                    <Link
                      href="/signup"
                      className="font-semibold text-[#111111] underline hover:no-underline"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Security micro-badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
          <ShieldCheck
            className={`w-3.5 h-3.5 ${isAdminContext ? "text-lime-400" : "text-emerald-400"}`}
          />
          <span>
            {isAdminContext
              ? "Role-gated administrative zone · Server-side permission check · Supabase secured"
              : "Real creators on camera · AI-fast pipeline · SOC2 & Supabase secured"}
          </span>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen py-12 px-4 sm:px-6 flex items-center justify-center font-sans antialiased">
          <div className="w-full max-w-md bg-[#FAF9F6] rounded-3xl p-8 animate-pulse h-96 shadow-2xl" />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
