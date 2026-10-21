import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppData, Profile, Post, Comment, Conversation } from "./types";
import { cursorFilter } from "./pagination";
export async function loadData(
  db: SupabaseClient,
  before?: string,
  limit = 20,
): Promise<AppData> {
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) throw new Error("Sign in to continue.");
  let postQuery = db
    .from("posts")
    .select(
      "*,author:community_profiles!posts_author_id_fkey(*),media:post_media(id,kind,caption),reactions(user_id,kind),comments(*,author:community_profiles!comments_author_id_fkey(*))",
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);
  if (before) postQuery = postQuery.or(cursorFilter(before));
  const requests = await Promise.all([
    db.from("community_profiles").select("*").eq("id", user.id).single(),
    db
      .from("private_profile_settings")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    db
      .from("discovery_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    postQuery,
    db.rpc("discover_people"),
    db.from("memberships").select("community_slug"),
    db.from("bookmarks").select("post_id"),
    db.from("connections").select("*"),
    db.from("conversations").select("*"),
    db.from("conversation_members").select("*"),
    db
      .from("messages")
      .select(
        "*,media:message_media(id,kind,caption),reactions:message_reactions(user_id,kind)",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40),
    db.from("blocks").select("blocked_id"),
    db.from("discovery_dismissals").select("target_id"),
    db.rpc("my_role"),
    db.rpc("conversation_receipts"),
    db.from("resource_entries").select("id,region,name,url,last_checked"),
    db.from("communities").select("*"),
    db.rpc("conversation_unread"),
  ]);
  for (const r of requests) if (r.error) throw new Error(r.error.message);
  const [
    me,
    settings,
    preferences,
    posts,
    people,
    memberships,
    bookmarks,
    connections,
    conversations,
    members,
    messages,
    notifications,
    blocks,
    dismissed,
    role,
    receipts,
    resources,
    communities,
    unreadCounts,
  ] = requests;
  const otherIds = (connections.data || []).map((c) =>
    c.requester_id === user.id ? c.recipient_id : c.requester_id,
  );
  const { data: others, error } = await db
    .from("community_profiles")
    .select("*")
    .in("id", otherIds.length ? otherIds : [user.id]);
  if (error) throw error;
  const conversationData = (conversations.data || []).map((c) => {
    const connection = (connections.data || []).find(
      (x) => x.id === c.connection_id,
    );
    const oid =
      connection?.requester_id === user.id
        ? connection?.recipient_id
        : connection?.requester_id;
    const member = (members.data || []).find((m) => m.conversation_id === c.id);
    return {
      ...c,
      ...member,
      unread_count: Number(unreadCounts.data?.[c.id] || 0),
      other: others?.find((p) => p.id === oid) || {
        id: oid,
        display_name: "Community member",
        username: "member",
        avatar: "bloom",
        bio: "",
      },
      other_read_at: (receipts.data || []).find(
        (r: { conversation_id: string; user_id: string }) =>
          r.conversation_id === c.id && r.user_id !== user.id,
      )?.last_read_at,
      messages: (messages.data || [])
        .filter((m) => m.conversation_id === c.id)
        .reverse(),
    };
  });
  return {
    me: {
      ...me.data,
      language: preferences.data?.language,
      intent: preferences.data?.intent,
      topics: settings.data?.topics,
    } as Profile,
    settings: {
      ...settings.data,
      quiet_start: String(settings.data?.quiet_start || "22:00").slice(0, 5),
      quiet_end: String(settings.data?.quiet_end || "08:00").slice(0, 5),
    },
    posts: posts.data as Post[],
    people: people.data || [],
    memberships: memberships.data?.map((m) => m.community_slug) || [],
    bookmarks: bookmarks.data?.map((b) => b.post_id) || [],
    connections: connections.data || [],
    conversations: conversationData as Conversation[],
    notifications: notifications.data || [],
    blocks: blocks.data?.map((b) => b.blocked_id) || [],
    dismissed: dismissed.data?.map((d) => d.target_id) || [],
    role: role.data || "member",
    reports: [],
    resources: resources.data || [],
    communities: communities.data || [],
  };
}
export async function loadPost(db: SupabaseClient, id: string) {
  const { data, error } = await db
    .from("posts")
    .select(
      "*,author:community_profiles!posts_author_id_fkey(*),media:post_media(id,kind,caption),reactions(user_id,kind),comments(*,author:community_profiles!comments_author_id_fkey(*))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Post | null;
}
export type { Comment };
