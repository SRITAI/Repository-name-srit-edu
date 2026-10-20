"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, Icon, Logo } from "@/components/ui";
export function AuthForm({
  kind,
  configured,
  google = false,
}: {
  kind: string;
  configured: boolean;
  google?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const signup = kind === "sign-up",
    forgot = kind === "forgot-password",
    reset = kind === "reset-password";
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    await send({ ...fields, adult: fields.adult === "on", kind });
  }
  async function send(p: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.next) {
        if (data.next.startsWith("http")) window.location.assign(data.next);
        else {
          router.push(data.next);
          router.refresh();
        }
      } else setMessage(data.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Logo />
        <Link href="/" className="text-link">
          <Icon name="left" size={16} /> Back to a little less alone
        </Link>
      </header>
      <main id="main" className="auth-layout">
        <div className="auth-story">
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>
            A space to be
            <br />
            <span className="pink-text">beautifully human.</span>
          </h1>
          <div className="auth-flower">✷</div>
          <p>
            You don’t need to have it figured out.
            <br />
            You just need somewhere to begin.
          </p>
          <div className="auth-promise">
            <Icon name="shield" size={20} />
            <span>
              Your story belongs to you.
              <br />
              <small>You choose how much to share.</small>
            </span>
          </div>
        </div>
        <section className="auth-card">
          <span className="eyebrow muted">WELCOME TO sritedu</span>
          <h2>
            {signup
              ? "Come as you are."
              : forgot
                ? "A fresh start."
                : reset
                  ? "Choose a new password."
                  : "Good to have you here."}
          </h2>
          <p>
            {signup
              ? "A small step toward feeling a little less alone."
              : forgot
                ? "We’ll send you a secure link to reset your password."
                : reset
                  ? "Use at least 10 characters."
                  : "Pick up your story, at your own pace."}
          </p>
          {!configured && (
            <div className="notice">
              <Icon name="lock" size={18} />
              <div>
                Live accounts aren’t connected yet.
                <br />
                <Link href="/preview/home">
                  Explore the clearly labelled fictional preview{" "}
                  <Icon name="arrow" size={14} />
                </Link>
              </div>
            </div>
          )}
          {message ? (
            <div className="success-message" role="status">
              <Icon name="mail" size={32} />
              <h3>Check your inbox.</h3>
              <p>{message}</p>
              <Link className="button secondary" href="/sign-in">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              {!reset && (
                <Field label="Email address">
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    maxLength={254}
                  />
                </Field>
              )}
              {!forgot && (
                <Field
                  label={reset ? "New password" : "Password"}
                  hint={
                    signup
                      ? "At least 10 characters. Make it your own."
                      : undefined
                  }
                >
                  <span className="password-field">
                    <input
                      name="password"
                      type={show ? "text" : "password"}
                      autoComplete={
                        signup || reset ? "new-password" : "current-password"
                      }
                      minLength={10}
                      maxLength={128}
                      required
                      placeholder="Your password"
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={show ? "Hide password" : "Show password"}
                      onClick={() => setShow(!show)}
                    >
                      <Icon name={show ? "eye-off" : "eye"} size={18} />
                    </button>
                  </span>
                </Field>
              )}
              {signup && (
                <label className="checkbox-label">
                  <input type="checkbox" name="adult" required />
                  <span>
                    I’m 18 or older. I agree to the{" "}
                    <Link href="/terms">terms</Link>,{" "}
                    <Link href="/privacy">privacy policy</Link>, and{" "}
                    <Link href="/guidelines">community guidelines</Link>.
                  </span>
                </label>
              )}
              {!signup && !forgot && !reset && (
                <Link href="/forgot-password" className="forgot-link">
                  Forgot your password?
                </Link>
              )}
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <Button className="full" disabled={busy}>
                {busy ? <Icon name="loader" className="spin" /> : null}
                {signup
                  ? "Create your account"
                  : forgot
                    ? "Send reset link"
                    : reset
                      ? "Update password"
                      : "Sign in"}
                <Icon name="arrow" size={18} />
              </Button>
              {google && !forgot && !reset && (
                <Button
                  variant="secondary"
                  type="button"
                  className="full"
                  disabled={busy}
                  onClick={() => send({ kind: "google" })}
                >
                  Continue with Google
                </Button>
              )}
            </form>
          )}
          <p className="auth-switch">
            {signup ? "Already have an account?" : "New around here?"}{" "}
            <Link href={signup ? "/sign-in" : "/sign-up"}>
              {signup ? "Sign in" : "Find your community"}
            </Link>
          </p>
          <div className="auth-small">
            <Icon name="lock" size={13} /> Pseudonyms welcome. No public email
            addresses.
          </div>
        </section>
      </main>
      <footer className="auth-footer">
        For adults 18+. Peer support, not clinical care or an emergency service.
      </footer>
    </div>
  );
}
