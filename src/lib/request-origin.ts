import type { NextRequest } from "next/server";

export function sameOrigin(req: NextRequest) {
  return (
    req.headers.get("origin") ===
    (process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
      : req.nextUrl.origin)
  );
}
