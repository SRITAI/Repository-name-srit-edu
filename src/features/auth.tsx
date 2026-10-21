"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, Icon, Logo } from "@/components/ui";

type AuthProps = { kind: string; configured: boolean; google?: boolean };

export function AuthForm(props: AuthProps) {
  return <AuthScreen key={props.kind} {...props} />;
}

function AuthScreen({ kind, configured, google = false }: AuthProps) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const signup = kind === "sign-up";
  const forgot = kind === "forgot-password";
  const reset = kind === "reset-password";
  const passwordStep = reset || (!forgot && step === "password");

  useEffect(() => {
    if (step === "password") passwordRef.current?.focus();
  }, [step]);

  async function send(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Please try again.");
      if (data.next) {
        if (data.next.startsWith("http")) window.location.assign(data.next);
        else {
          router.push(data.next);
          router.refresh();
        }
      } else setMessage(data.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!forgot && !reset && step === "email") {
      setError("");
      setStep("password");
      return;
    }
    const fields = new FormData(event.currentTarget);
    await send({
      kind,
      email: email.trim(),
      ...(forgot ? {} : { password }),
      ...(signup ? { adult: fields.get("adult") === "on" } : {}),
    });
  }

  const title = message
    ? "Check your email."
    : forgot
      ? "Forgot your password?"
      : reset
        ? "Set a new password."
        : signup
          ? passwordStep
            ? "Create a password."
            : "Your story starts here."
          : "Welcome back.";

  return (
    <div className="auth-page auth-simple">
      <header className="auth-header">
        <Logo />
        <Link href="/" className="auth-back-link">
          <Icon name="left" size={16} /> Back to home
        </Link>
      </header>
      <main id="main" className="auth-layout auth-simple-layout">
        <section
          className="auth-card auth-simple-card"
          aria-labelledby="auth-title"
        >
          {signup && !message && (
            <div
              className="auth-steps"
              aria-label={`Step ${passwordStep ? 2 : 1} of 2`}
            >
              <span>CREATE YOUR ACCOUNT</span>
              <b>{passwordStep ? "2" : "1"} / 2</b>
              <i
                className={passwordStep ? "complete" : ""}
                aria-hidden="true"
              />
            </div>
          )}
          {!signup && !message && (
            <span className="auth-kicker">YOUR SPACE. YOUR PACE.</span>
          )}
          <h1 id="auth-title">{title}</h1>
          <p className="auth-intro">
            {message
              ? message
              : forgot
                ? "We’ll email you a link to get back in."
                : reset
                  ? "Choose a password with at least 10 characters."
                  : passwordStep
                    ? "One more step to your space."
                    : signup
                      ? "Start with your email. The rest can wait."
                      : "Log in to pick up where you left off."}
          </p>
          {message ? (
            <div className="auth-email-success" role="status">
              <span>
                <Icon name="mail" size={30} />
              </span>
              <p>
                Open the link in your inbox to continue. Check your spam folder
                too.
              </p>
              <Link href="/sign-in" className="button primary full">
                Back to log in
              </Link>
            </div>
          ) : (
            <>
              {!configured && (
                <div className="notice auth-setup-note">
                  <Icon name="lock" size={16} />
                  <div>
                    <span>Live accounts aren’t connected yet.</span>
                    <Link href="/preview/home">
                      Explore the fictional preview{" "}
                      <Icon name="arrow" size={12} />
                    </Link>
                  </div>
                </div>
              )}
              <form
                onSubmit={submit}
                aria-label={
                  signup
                    ? "Create an account"
                    : forgot
                      ? "Reset password email"
                      : reset
                        ? "New password"
                        : "Log in"
                }
              >
                {!passwordStep && (
                  <Field label="Email address">
                    <input
                      name="email"
                      type="email"
                      autoComplete="username"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="name@example.com"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={busy}
                    />
                  </Field>
                )}
                {passwordStep && !reset && (
                  <div className="auth-email-summary">
                    <span>
                      <Icon name="mail" size={16} />
                      <b>{email}</b>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setError("");
                        setShow(false);
                      }}
                      disabled={busy}
                      aria-label="Change email address"
                    >
                      Edit
                    </button>
                    <input
                      type="hidden"
                      name="email"
                      value={email}
                      autoComplete="username"
                    />
                  </div>
                )}
                {passwordStep && (
                  <Field
                    label={reset ? "New password" : "Password"}
                    hint={signup ? "Use at least 10 characters." : undefined}
                  >
                    <span className="password-field">
                      <input
                        ref={passwordRef}
                        name="password"
                        type={show ? "text" : "password"}
                        autoComplete={
                          signup || reset ? "new-password" : "current-password"
                        }
                        minLength={signup || reset ? 10 : 1}
                        maxLength={128}
                        required
                        placeholder={
                          signup || reset
                            ? "Create a password"
                            : "Enter your password"
                        }
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={busy}
                        aria-label={reset ? "New password" : "Password"}
                      />
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={show ? "Hide password" : "Show password"}
                        aria-pressed={show}
                        onClick={() => setShow(!show)}
                        disabled={busy}
                      >
                        <Icon name={show ? "eye-off" : "eye"} size={20} />
                      </button>
                    </span>
                  </Field>
                )}
                {signup && passwordStep && (
                  <label className="checkbox-label auth-consent">
                    <input
                      type="checkbox"
                      name="adult"
                      required
                      disabled={busy}
                    />
                    <span>
                      I’m 18 or older and agree to the{" "}
                      <Link href="/terms">terms</Link>,{" "}
                      <Link href="/privacy">privacy policy</Link> and{" "}
                      <Link href="/guidelines">community guidelines</Link>.
                    </span>
                  </label>
                )}
                {!signup && passwordStep && !reset && (
                  <Link href="/forgot-password" className="forgot-link">
                    Forgot your password?
                  </Link>
                )}
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <Button
                  className="full auth-continue"
                  disabled={busy}
                  type="submit"
                >
                  {busy && <Icon name="loader" className="spin" size={18} />}
                  {busy
                    ? "Please wait…"
                    : forgot
                      ? "Send reset link"
                      : reset
                        ? "Update password"
                        : !passwordStep
                          ? "Continue"
                          : signup
                            ? "Create account"
                            : "Log in"}
                </Button>
              </form>
              {google && !forgot && !reset && !passwordStep && (
                <>
                  <div className="auth-divider">
                    <span>or</span>
                  </div>
                  <Button
                    variant="secondary"
                    type="button"
                    className="full auth-google"
                    disabled={busy}
                    onClick={() => send({ kind: "google" })}
                  >
                    Continue with Google
                  </Button>
                </>
              )}
            </>
          )}
          {!message && (
            <p className="auth-switch">
              {forgot || reset
                ? "Remember your password?"
                : signup
                  ? "Already have an account?"
                  : "New to sritedu?"}{" "}
              <Link href={signup || forgot || reset ? "/sign-in" : "/sign-up"}>
                {signup || forgot || reset ? "Log in" : "Sign up"}
              </Link>
            </p>
          )}
          <div className="auth-small">
            <Icon name="lock" size={13} />
            Your email stays private.
          </div>
        </section>
      </main>
      <footer className="auth-footer">
        <Link href="/privacy">Privacy</Link>
        <span>·</span>
        <Link href="/help">Help</Link>
        <p>For adults 18+. Peer support, at your pace.</p>
      </footer>
    </div>
  );
}
