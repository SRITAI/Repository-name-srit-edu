import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverClient, adminClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = z.uuid().parse((await params).id);
    const db = await serverClient();
    const caseId = req.nextUrl.searchParams.get("case");
    const { data: path, error } = caseId
      ? await db.rpc("evidence_media_access", {
          case_id: z.uuid().parse(caseId),
          media_id: id,
        })
      : await db.rpc("media_access", {
          media_id: id,
          want_poster: req.nextUrl.searchParams.get("poster") === "1",
        });
    if (error || !path)
      return new NextResponse("Media unavailable", {
        status: 404,
        headers: { "Cache-Control": "private, no-store" },
      });
    const { data, error: downloadError } = await adminClient()
      .storage.from("private-media")
      .download(path);
    if (downloadError || !data) throw new Error("Download failed");
    const buffer = Buffer.from(await data.arrayBuffer());
    const range = req.headers.get("range");
    const mime = path.endsWith(".mp4") ? "video/mp4" : "image/webp";
    const headers: Record<string, string> = {
      "Content-Type": mime,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      "Accept-Ranges": "bytes",
    };
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match) return new NextResponse(null, { status: 416 });
      const start = Number(match[1]),
        end = Math.min(
          match[2] ? Number(match[2]) : buffer.length - 1,
          buffer.length - 1,
        );
      if (start >= buffer.length || start > end)
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${buffer.length}` },
        });
      return new NextResponse(buffer.subarray(start, end + 1), {
        status: 206,
        headers: {
          ...headers,
          "Content-Range": `bytes ${start}-${end}/${buffer.length}`,
          "Content-Length": String(end - start + 1),
        },
      });
    }
    return new NextResponse(buffer, {
      headers: { ...headers, "Content-Length": String(buffer.length) },
    });
  } catch {
    return new NextResponse("Media unavailable", {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
