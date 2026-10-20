import { z } from "zod";
export const authSchema = z.object({
  email: z.email(),
  password: z.string().min(10, "Use at least 10 characters.").max(128),
  adult: z.boolean().optional(),
});
export const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(50),
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{3,24}$/,
      "Use 3–24 lowercase letters, numbers, or underscores.",
    ),
  bio: z.string().max(300).default(""),
  avatar: z.string().max(200).default("bloom"),
  language: z.enum(["English", "Hindi", "Hinglish"]),
  intent: z.string().max(80).default(""),
  topics: z.array(z.string().max(80)).max(10),
  discovery: z.boolean(),
  show_topics: z.boolean(),
  profile_visible: z.boolean(),
  accept_requests: z.boolean(),
  accepted: z.literal(true),
});
export const postSchema = z.object({
  body: z.string().trim().min(1).max(10000),
  community_slug: z.string().max(80),
  audience: z.enum(["community", "connections", "draft"]),
  warning: z.string().max(120).default(""),
  comments_enabled: z.boolean().default(true),
  hide_counts: z.boolean().default(false),
  journey_id: z.uuid().nullable().optional(),
});
export const messageSchema = z.object({
  conversation_id: z.uuid(),
  body: z.string().trim().max(4000),
  reply_to: z.uuid().nullable().optional(),
});
export const reportSchema = z.object({
  target_type: z.enum([
    "profile",
    "post",
    "comment",
    "message",
    "media",
    "appeal",
  ]),
  target_id: z.uuid(),
  reason: z.string().trim().min(5).max(2000),
});
export const settingsSchema = z.object({
  discovery: z.boolean(),
  show_topics: z.boolean(),
  profile_visible: z.boolean(),
  accept_requests: z.boolean(),
  reduce_motion: z.boolean(),
  read_receipts: z.boolean(),
  notifications: z.boolean(),
  quiet_start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  quiet_end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  muted_topics: z.array(z.string()).max(10),
});
