"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MotionConfig } from "motion/react";
import { browserClient } from "@/lib/supabase/browser";
import { previewData } from "@/lib/preview";
import type { AppData, Post, Connection, Settings, Profile } from "@/lib/types";
import { Icon } from "@/components/ui";
import { cursor } from "@/lib/pagination";
type Payload = Record<string, unknown>;
type Result = { id?: string };
type AppContextValue = {
  data: AppData;
  preview: boolean;
  busy: boolean;
  offline: boolean;
  act: (kind: string, p: Payload) => Promise<Result>;
  refresh: () => Promise<void>;
  toast: (message: string) => void;
  upload: (
    file: File,
    type: "post" | "message" | "avatar",
    id: string,
    caption?: string,
    onProgress?: (n: number) => void,
  ) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};
const AppContext = createContext<AppContextValue | null>(null);
export const useApp = () => {
  const v = useContext(AppContext);
  if (!v) throw new Error("App provider missing");
  return v;
};
export function AppProvider({
  initial,
  preview = false,
  children,
}: {
  initial?: AppData;
  preview?: boolean;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<AppData>(initial || previewData);
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [notice, setNotice] = useState("");
  const [hasMore, setHasMore] = useState((initial?.posts.length || 0) >= 20);
  const [ready, setReady] = useState(!preview);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedLimit = useRef(20);
  useEffect(() => {
    if (!preview && initial) setData(initial);
  }, [initial, preview]);
  const toast = useCallback((message: string) => {
    setNotice(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(""), 5000);
  }, []);
  useEffect(() => {
    if (preview) {
      try {
        const saved = sessionStorage.getItem("sritedu-fictional-preview-v1");
        if (saved) setData(JSON.parse(saved));
      } catch {
        /* An unavailable session store does not affect live data. */
      }
      setReady(true);
    }
  }, [preview]);
  useEffect(() => {
    if (preview && ready) {
      try {
        sessionStorage.setItem(
          "sritedu-fictional-preview-v1",
          JSON.stringify(data),
        );
      } catch {
        toast(
          "Preview storage is full. Large media stays in this tab until refresh.",
        );
      }
    }
  }, [data, preview, ready, toast]);
  const refresh = useCallback(async () => {
    if (preview) return;
    const params = new URLSearchParams({ limit: String(feedLimit.current) });
    const selected = /\/post\/([a-f0-9-]{36})$/.exec(
      window.location.pathname,
    )?.[1];
    if (selected) params.set("post", selected);
    const res = await fetch("/api/data?" + params, { cache: "no-store" });
    const next = await res.json();
    if (!res.ok) throw new Error(next.error);
    setData((old) => ({
      ...next,
      conversations: next.conversations.map(
        (c: AppData["conversations"][number]) => {
          const oldest = c.messages[0]?.created_at;
          const previous = old.conversations.find((p) => p.id === c.id);
          return {
            ...c,
            messages: [
              ...(previous?.messages.filter(
                (m) => !oldest || m.created_at < oldest,
              ) || []),
              ...c.messages,
            ],
          };
        },
      ),
    }));
    setHasMore(next.posts.length >= feedLimit.current);
    setOffline(false);
  }, [preview]);
  useEffect(() => {
    const off = () => setOffline(true),
      on = () => {
        setOffline(false);
        refresh().catch(() => setOffline(true));
      };
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    if (preview)
      return () => {
        window.removeEventListener("offline", off);
        window.removeEventListener("online", on);
      };
    const db = browserClient();
    const channel = db
      ?.channel("authorized-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => refresh().catch(() => setOffline(true)),
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${data.me.id}`,
        },
        () => refresh().catch(() => setOffline(true)),
      )
      .subscribe();
    const poll = setInterval(() => {
      if (document.visibilityState === "visible")
        refresh().catch(() => setOffline(true));
    }, 10000);
    return () => {
      window.removeEventListener("offline", off);
      window.removeEventListener("online", on);
      clearInterval(poll);
      if (channel) db?.removeChannel(channel);
    };
  }, [preview, refresh, data.me.id]);
  async function act(kind: string, p: Payload): Promise<Result> {
    setBusy(true);
    try {
      if (!preview) {
        const r = await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, payload: p }),
        });
        const out = await r.json();
        if (!r.ok) throw new Error(out.error);
        await refresh();
        return out;
      }
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      setData((d) => {
        const n = structuredClone(d);
        const me = n.me.id;
        switch (kind) {
          case "membership":
            n.memberships = p.joined
              ? [...new Set([...n.memberships, p.slug as string])]
              : n.memberships.filter((s) => s !== p.slug);
            break;
          case "post": {
            const existing = n.posts.find((x) => x.id === p.id);
            if (existing) Object.assign(existing, p);
            else
              n.posts.unshift({
                ...p,
                body: String(p.body),
                community_slug: String(p.community_slug),
                audience: p.audience as Post["audience"],
                warning: String(p.warning || ""),
                comments_enabled: p.comments_enabled !== false,
                hide_counts: p.hide_counts === true,
                id,
                author_id: me,
                author: n.me,
                created_at: now,
                reactions: [],
                comments: [],
                media: [],
              });
            break;
          }
          case "delete_post":
            n.posts = n.posts.filter((x) => x.id !== p.id);
            break;
          case "reaction": {
            const post = n.posts.find((x) => x.id === p.id);
            if (post) {
              const old = post.reactions?.find((r) => r.user_id === me);
              post.reactions =
                post.reactions?.filter((r) => r.user_id !== me) || [];
              if (old?.kind !== p.reaction)
                post.reactions.push({
                  user_id: me,
                  kind: p.reaction as string,
                });
            }
            break;
          }
          case "bookmark":
            n.bookmarks = n.bookmarks.includes(p.id as string)
              ? n.bookmarks.filter((x) => x !== p.id)
              : [...n.bookmarks, p.id as string];
            break;
          case "comment": {
            n.posts
              .find((x) => x.id === p.post_id)
              ?.comments?.push({
                id,
                post_id: p.post_id as string,
                author_id: me,
                author: n.me,
                body: p.body as string,
                parent_id: p.parent_id as string,
                created_at: now,
              });
            break;
          }
          case "delete_comment":
            n.posts.forEach(
              (x) =>
                (x.comments = x.comments?.filter(
                  (c) => c.id !== p.id && c.parent_id !== p.id,
                )),
            );
            break;
          case "request":
            n.connections.push({
              id,
              requester_id: me,
              recipient_id: p.target_id as string,
              note: p.note as string,
              status: "pending",
            });
            break;
          case "connection": {
            const c = n.connections.find((x) => x.id === p.id);
            if (c) {
              if (p.status === "cancel")
                n.connections = n.connections.filter((x) => x.id !== c.id);
              else {
                c.status = p.status as Connection["status"];
                if (p.status === "accepted") {
                  const other = n.people.find(
                    (x) =>
                      x.id ===
                      (c.requester_id === me ? c.recipient_id : c.requester_id),
                  );
                  if (other)
                    n.conversations.push({
                      id,
                      other,
                      muted: false,
                      archived: false,
                      ended: false,
                      messages: [],
                    });
                }
              }
            }
            break;
          }
          case "message":
            n.conversations
              .find((c) => c.id === p.conversation_id)
              ?.messages.push({
                conversation_id: String(p.conversation_id),
                body: String(p.body || ""),
                reply_to: p.reply_to as string | null,
                id,
                sender_id: me,
                created_at: now,
                media: [],
              });
            break;
          case "message_reaction":
            for (const c of n.conversations) {
              const m = c.messages.find((m) => m.id === p.id);
              if (m) {
                const exists = m.reactions?.some((r) => r.user_id === me);
                m.reactions =
                  m.reactions?.filter((r) => r.user_id !== me) || [];
                if (!exists)
                  m.reactions.push({ user_id: me, kind: "Sending support" });
              }
            }
            break;
          case "conversation": {
            const c = n.conversations.find((c) => c.id === p.id);
            if (c) {
              if (p.end) c.ended = true;
              else Object.assign(c, p, p.read ? { last_read_at: now } : {});
            }
            break;
          }
          case "block":
            if (p.unblock) n.blocks = n.blocks.filter((x) => x !== p.target_id);
            else {
              n.blocks.push(p.target_id as string);
              n.people = n.people.filter((x) => x.id !== p.target_id);
              n.posts = n.posts.filter((x) => x.author_id !== p.target_id);
              n.conversations = n.conversations.filter(
                (x) => x.other.id !== p.target_id,
              );
              n.connections = n.connections.filter(
                (c) =>
                  c.requester_id !== p.target_id &&
                  c.recipient_id !== p.target_id,
              );
            }
            break;
          case "dismiss":
            n.dismissed.push(p.target_id as string);
            break;
          case "settings":
            n.settings = p as Settings;
            break;
          case "read_notifications":
            n.notifications.forEach((x) => (x.read = true));
            break;
          case "onboard":
            n.me = { ...n.me, ...p } as Profile;
            Object.assign(n.settings, p);
            n.memberships = p.topics as string[];
            break;
          case "report":
            n.reports.unshift({
              id,
              target_id: p.target_id as string,
              target_type: p.target_type as string,
              reason: p.reason as string,
              status: "open",
              created_at: now,
            });
            break;
          case "moderate": {
            const r = n.reports.find((x) => x.id === p.id);
            if (r)
              r.status =
                p.action === "review"
                  ? "reviewing"
                  : p.action === "dismiss"
                    ? "dismissed"
                    : "resolved";
            break;
          }
          case "deactivate":
            toast("Preview only. No real account was deactivated.");
            break;
        }
        return n;
      });
      return { id: (p.id as string) || id };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please retry.";
      toast(message);
      throw e;
    } finally {
      setBusy(false);
    }
  }
  async function upload(
    file: File,
    type: "post" | "message" | "avatar",
    id: string,
    caption = "",
    onProgress?: (n: number) => void,
  ) {
    if (preview) {
      if (!/^image\/(jpeg|png|webp)$|^video\/(mp4|webm)$/.test(file.type))
        throw new Error("Choose a JPEG, PNG, WebP, MP4, or WebM.");
      const limit = file.type.startsWith("image/") ? 10 : 50;
      if (file.size > limit * 1024 * 1024)
        throw new Error(`Maximum file size is ${limit} MB.`);
      const url = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      onProgress?.(100);
      setData((d) => {
        const n = structuredClone(d);
        if (type === "avatar") n.me.avatar = url;
        else {
          const media = {
            id: crypto.randomUUID(),
            kind: file.type.startsWith("image/")
              ? ("image" as const)
              : ("video" as const),
            url,
            caption,
          };
          if (type === "post")
            n.posts.find((p) => p.id === id)?.media?.push(media);
          else
            n.conversations.forEach((c) =>
              c.messages.find((m) => m.id === id)?.media?.push(media),
            );
        }
        return n;
      });
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const form = new FormData();
      form.set("file", file);
      form.set("type", type);
      form.set("id", id);
      form.set("caption", caption);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");
      xhr.upload.onprogress = (e) =>
        onProgress?.(
          e.lengthComputable ? Math.round((e.loaded / e.total) * 90) : 20,
        );
      xhr.onload = () => {
        try {
          const body = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            onProgress?.(100);
            resolve();
          } else reject(new Error(body.error || "Upload failed."));
        } catch {
          reject(new Error("Upload interrupted. Retry when you’re connected."));
        }
      };
      xhr.onerror = () =>
        reject(new Error("Upload failed. Check your connection and retry."));
      xhr.send(form);
    });
    await refresh();
  }
  async function loadMore() {
    if (preview) {
      setHasMore(false);
      return;
    }
    const last = data.posts.at(-1);
    const res = await fetch(
      "/api/data?before=" +
        encodeURIComponent(last ? cursor(last.created_at, last.id) : ""),
      { cache: "no-store" },
    );
    const next = await res.json();
    if (!res.ok) {
      toast(next.error);
      return;
    }
    setData((d) => ({
      ...d,
      posts: [
        ...d.posts,
        ...next.posts.filter((p: Post) => !d.posts.some((x) => x.id === p.id)),
      ],
    }));
    setHasMore(next.posts.length >= 20);
    feedLimit.current = Math.min(200, feedLimit.current + next.posts.length);
  }
  const reduce = data.settings.reduce_motion;
  return (
    <AppContext.Provider
      value={{
        data,
        preview,
        busy,
        offline,
        act,
        refresh,
        toast,
        upload,
        loadMore,
        hasMore,
        setData,
      }}
    >
      <MotionConfig reducedMotion={reduce ? "always" : "user"}>
        <div
          key={ready ? "restored" : "restoring"}
          data-reduce-motion={reduce ? "true" : undefined}
        >
          {children}
          {offline && (
            <div className="offline-banner" role="status">
              <Icon name="offline" size={16} /> Connection interrupted. Your
              work stays here; retry when online.
            </div>
          )}
          {notice && (
            <div className="toast" role="status">
              <Icon name="flower" size={18} />
              {notice}
              <button
                className="icon-button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </MotionConfig>
    </AppContext.Provider>
  );
}
