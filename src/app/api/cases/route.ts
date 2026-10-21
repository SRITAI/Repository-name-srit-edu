import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverClient } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/request-origin";
export async function GET() {
  try {
    const db = await serverClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new Error();
    const { data, error } = await db.rpc("my_cases");
    if (error) throw error;
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Sign in to see your reports." },
      { status: 401 },
    );
  }
}
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Request origin rejected." },
      { status: 403 },
    );
  try {
    const p = z
      .object({
        target_id: z.uuid(),
        reason: z.string().trim().min(5).max(2000),
      })
      .parse(await req.json());
    const { error } = await (await serverClient()).rpc("submit_appeal", p);
    if (error) throw error;
    return NextResponse.json({ saved: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Appeal could not be saved." },
      { status: 400 },
    );
  }
}
