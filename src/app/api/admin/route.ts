import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sameOrigin } from "../action/route";
export async function GET() {
  try {
    const db = await serverClient();
    const { data: role } = await db.rpc("my_role");
    if (!["admin", "moderator"].includes(role))
      throw new Error("Restricted to community care.");
    const [reports, actions, communities, resources] = await Promise.all([
      db
        .from("reports")
        .select("id,reporter_id,target_type,target_id,reason,status,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      db
        .from("moderation_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(40),
      db.from("communities").select("*"),
      db.from("resource_entries").select("*"),
    ]);
    for (const r of [reports, actions, communities, resources])
      if (r.error) throw r.error;
    const { data: metrics, error: metricsError } =
      await db.rpc("service_metrics");
    if (metricsError) throw metricsError;
    return NextResponse.json(
      {
        metrics,
        reports: reports.data,
        actions: actions.data,
        communities: communities.data,
        resources: resources.data,
        configuration: {
          storage: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          scanning: !!process.env.MEDIA_SCAN_URL,
          moderation:
            "Human review only. Staffing and coverage must be assigned by the owner before launch.",
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Access restricted." },
      { status: 403 },
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
    const { id, mode, note } = z
      .object({
        id: z.uuid(),
        mode: z.enum(["review", "remove", "restore_account"]).default("review"),
        note: z.string().min(5).max(2000).optional(),
      })
      .parse(await req.json());
    const db = await serverClient();
    const { data, error } =
      mode === "review"
        ? await db.rpc("review_evidence", { case_id: id })
        : await db.rpc(
            mode === "remove" ? "remove_reported_item" : "restore_account",
            { case_id: id, note: note || "Human review decision" },
          );
    if (error) throw error;
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Evidence access denied." },
      { status: 403 },
    );
  }
}
