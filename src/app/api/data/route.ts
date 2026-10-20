import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { loadData, loadPost } from "@/lib/data";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const db = await serverClient();
    const limit = z.coerce
      .number()
      .int()
      .min(20)
      .max(200)
      .parse(req.nextUrl.searchParams.get("limit") || 20);
    const data = await loadData(
      db,
      req.nextUrl.searchParams.get("before") || undefined,
      limit,
    );
    const postId = req.nextUrl.searchParams.get("post");
    if (postId) {
      const post = await loadPost(db, z.uuid().parse(postId));
      if (post && !data.posts.some((p) => p.id === post.id))
        data.posts.push(post);
    }
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unable to load your space." },
      { status: 401 },
    );
  }
}
