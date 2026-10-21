import { NextRequest, NextResponse } from "next/server";
import { serverClient, adminClient } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/request-origin";
export async function GET() {
  try {
    const db = await serverClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new Error("Sign in to export your data.");
    const admin = adminClient();
    const tables = [
      "community_profiles",
      "private_profile_settings",
      "discovery_preferences",
      "memberships",
      "connections",
      "posts",
      "comments",
      "reactions",
      "bookmarks",
      "conversation_members",
      "messages",
      "notifications",
      "blocks",
      "reports",
    ];
    const result: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      notice:
        "Your own account and authored data. Media files remain separately access-controlled. Includes all pages, not just the recent feed.",
    };
    for (const table of tables) {
      const column =
        table === "community_profiles"
          ? "id"
          : ["posts", "comments"].includes(table)
            ? "author_id"
            : table === "messages"
              ? "sender_id"
              : table === "blocks"
                ? "blocker_id"
                : table === "reports"
                  ? "reporter_id"
                  : "user_id";
      const rows: unknown[] = [];
      for (let offset = 0; ; offset += 1000) {
        let q = admin
          .from(table)
          .select("*")
          .range(offset, offset + 999);
        if (table === "connections")
          q = q.or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);
        else q = q.eq(column, user.id);
        const { data, error } = await q;
        if (error) throw error;
        rows.push(...data);
        if (data.length < 1000) break;
      }
      result[table] = rows;
    }
    return new NextResponse(JSON.stringify(result, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="sritedu-data.json"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export unavailable." },
      { status: 401 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Request origin rejected." },
      { status: 403 },
    );
  try {
    const db = await serverClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new Error("Sign in to continue.");
    const { confirmation, password } = await req.json();
    if (confirmation !== "DELETE") throw new Error("Type DELETE to confirm.");
    if (user.app_metadata.provider === "email") {
      if (typeof password !== "string")
        throw new Error("Confirm your password.");
      const { error } = await db.auth.signInWithPassword({
        email: user.email!,
        password,
      });
      if (error) throw new Error("Password verification failed.");
    } else if (
      !user.last_sign_in_at ||
      Date.now() - new Date(user.last_sign_in_at).getTime() > 5 * 60000
    )
      throw new Error("Sign in again before deleting your account.");
    const { error } = await db.rpc("delete_community_account");
    if (error) throw error;
    await db.auth.signOut({ scope: "local" });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Deletion failed. Please retry.",
      },
      { status: 400 },
    );
  }
}
