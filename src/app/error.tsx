"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="error-page">
      <span>✷</span>
      <h1>A little pause.</h1>
      <p>Your space couldn’t load. Check your connection and try again.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <Link href="/help">Help & support</Link>
    </main>
  );
}
