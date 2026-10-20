import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverClient, adminClient } from "@/lib/supabase/server";
import { inspectType, validateMedia } from "@/lib/media";
import { sameOrigin } from "../action/route";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Request origin rejected." },
      { status: 403 },
    );
  if (Number(req.headers.get("content-length")) > 53 * 1024 * 1024)
    return NextResponse.json(
      { error: "This upload is too large." },
      { status: 413 },
    );
  try {
    const db = await serverClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user)
      return NextResponse.json(
        { error: "Sign in before uploading." },
        { status: 401 },
      );
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 50 * 1024 * 1024)
      throw new Error("Choose a file under 50 MB.");
    const type = z.enum(["post", "message", "avatar"]).parse(form.get("type"));
    const target = type === "avatar" ? user.id : z.uuid().parse(form.get("id"));
    const caption = z
      .string()
      .max(300)
      .parse(form.get("caption") || "");
    const bytes = Buffer.from(await file.arrayBuffer());
    const actual = await inspectType(bytes);
    const { data: ticket, error } = await db.rpc("reserve_upload", {
      target_type: type,
      target_id: target,
      media_kind: actual.kind,
    });
    if (error) throw error;
    let media;
    try {
      media = await validateMedia(bytes);
    } catch {
      throw new Error(
        "This file could not be validated. Try a different image, or a playable MP4/WebM video of 90 seconds or less.",
      );
    }
    const admin = adminClient();
    const { error: uploadError } = await admin.storage
      .from("private-media")
      .upload(ticket.path, media.bytes, {
        contentType: media.mime,
        upsert: false,
        cacheControl: "0",
      });
    if (uploadError) throw uploadError;
    if (media.poster) {
      const { error: e } = await admin.storage
        .from("private-media")
        .upload("media/" + ticket.id + "-poster.webp", media.poster, {
          contentType: "image/webp",
          cacheControl: "0",
        });
      if (e) throw e;
    }
    const { error: finalizeError } = await admin.rpc("finalize_upload", {
      ticket_id: ticket.id,
      owner_id: user.id,
      caption,
      has_poster: !!media.poster,
    });
    if (finalizeError) throw finalizeError;
    return NextResponse.json(
      { id: ticket.id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : typeof e === "object" && e && "message" in e
              ? String(e.message)
              : "Upload failed. Your file is not shared. Please retry.",
      },
      { status: 400 },
    );
  }
}
