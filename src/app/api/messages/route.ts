import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverClient } from "@/lib/supabase/server";
import { cursorFilter } from "@/lib/pagination";
export async function GET(req: NextRequest) {
  try {
    const id = z.uuid().parse(req.nextUrl.searchParams.get("id"));
    const before = req.nextUrl.searchParams.get("before");
    const db = await serverClient();
    let query = db
      .from("messages")
      .select(
        "*,media:message_media(id,kind,caption),reactions:message_reactions(user_id,kind)",
      )
      .eq("conversation_id", id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(50);
    if (before) query = query.or(cursorFilter(before));
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data.reverse(), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "These messages are unavailable." },
      { status: 403 },
    );
  }
}
