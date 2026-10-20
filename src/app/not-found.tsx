import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="error-page">
      <span>✷</span>
      <h1>A little off the path.</h1>
      <p>This page isn’t here. Your community still is.</p>
      <Link href="/" className="button primary">
        Back to sritedu ↗
      </Link>
    </main>
  );
}
