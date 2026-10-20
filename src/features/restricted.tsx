"use client";
import Link from "next/link";
import { Logo, Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { Cases } from "./cases";
export function Restricted({
  id,
  suspended,
}: {
  id: string;
  suspended: boolean;
}) {
  const router = useRouter();
  return (
    <div className="restricted-page">
      <Logo />
      <main id="main">
        <h1>Your account is {suspended ? "restricted" : "deactivated"}.</h1>
        <p>
          You can request a human review below. Your private data is unavailable
          to other members while this restriction is active. There is no
          guaranteed review time.
        </p>
        <Cases accountId={id} />
        <Link href="/help">Help & support</Link>
        <Button
          variant="ghost"
          onClick={async () => {
            const r = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ kind: "sign-out" }),
            });
            if (r.ok) {
              router.push("/");
              router.refresh();
            }
          }}
        >
          Sign out
        </Button>
      </main>
    </div>
  );
}
