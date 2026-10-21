import { sameOrigin } from "@/lib/request-origin";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverClient } from "@/lib/supabase/server";
import {
  postSchema,
  profileSchema,
  reportSchema,
  settingsSchema,
  messageSchema,
} from "@/lib/schema";
const id = z.uuid();
const schemas: Record<string, z.ZodType> = {
  onboard: profileSchema,
  post: postSchema.extend({ id: id.optional() }),
  reaction: z.object({
    id,
    reaction: z.enum([
      "I hear you",
      "Sending support",
      "Thank you for sharing",
    ]),
  }),
  bookmark: z.object({ id }),
  delete_post: z.object({ id }),
  comment: z.object({
    post_id: id,
    body: z.string().trim().min(1).max(2000),
    parent_id: id.nullable().optional(),
  }),
  delete_comment: z.object({ id }),
  request: z.object({ target_id: id, note: z.string().trim().min(1).max(300) }),
  connection: z.object({
    id,
    status: z.enum(["accepted", "declined", "cancel"]),
  }),
  message: messageSchema,
  message_reaction: z.object({ id }),
  conversation: z.object({
    id,
    muted: z.boolean().optional(),
    archived: z.boolean().optional(),
    read: z.boolean().optional(),
    end: z.boolean().optional(),
  }),
  block: z.object({ target_id: id, unblock: z.boolean().optional() }),
  dismiss: z.object({ target_id: id }),
  membership: z.object({ slug: z.string().max(80), joined: z.boolean() }),
  settings: settingsSchema,
  report: reportSchema,
  read_notifications: z.object({}),
  deactivate: z.object({}),
  moderate: z.object({
    id,
    action: z.enum([
      "remove",
      "restore",
      "suspend",
      "resolve",
      "dismiss",
      "review",
    ]),
    note: z.string().min(5).max(2000),
  }),
  community_edit: z.object({
    slug: z.string().max(80),
    description: z.string().max(1000),
    guidelines: z.string().max(3000),
    pinned: z.string().max(1000),
  }),
  resource: z.object({
    region: z.string().min(2).max(100),
    name: z.string().min(2).max(200),
    url: z.url().startsWith("https://"),
    source_url: z.url().startsWith("https://"),
    last_checked: z.iso.date(),
  }),
};
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Request origin rejected." },
      { status: 403 },
    );
  try {
    const input = await req.json();
    const schema = schemas[input.kind];
    if (!schema) throw new Error("Unsupported action.");
    const p = schema.parse(input.payload);
    const db = await serverClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user)
      return NextResponse.json(
        { error: "Sign in to continue." },
        { status: 401 },
      );
    const { data, error } =
      input.kind === "onboard"
        ? await db.rpc("onboard", { p })
        : await db.rpc("act", { kind: input.kind, p });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data || {}, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof z.ZodError
            ? e.issues[0]?.message
            : e instanceof Error
              ? e.message
              : "Could not save. Please retry.",
      },
      { status: 400 },
    );
  }
}
