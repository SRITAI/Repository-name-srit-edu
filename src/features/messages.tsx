"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Button, Empty, Field, Icon, Modal } from "@/components/ui";
import { ActionMenu } from "@/components/ui";
import { SupportNote } from "@/components/support-note";
import { cursor } from "@/lib/pagination";
import type { Message } from "@/lib/types";
import { useApp } from "./app/provider";
import { timeAgo } from "./posts/post-card";
import { MediaGallery } from "./posts/media";
import { ReportDialog, BlockDialog } from "./app/safety";
export function Messages({ id }: { id?: string }) {
  const { data, act, upload, preview, toast, setData } = useApp();
  const router = useRouter();
  const prefix = preview ? "/preview" : "";
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File>();
  const [caption, setCaption] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string>();
  const [reply, setReply] = useState<Message | null>(null);
  const [report, setReport] = useState<{ type: string; id: string } | null>(
    null,
  );
  const [block, setBlock] = useState(false);
  const [end, setEnd] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderEnd, setOlderEnd] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const chat = data.conversations.find((c) => c.id === id && !c.ended);
  const chats = data.conversations.filter(
    (c) =>
      !c.ended &&
      c.archived === archived &&
      c.other.display_name.toLowerCase().includes(search.toLowerCase()),
  );
  useEffect(() => {
    setText("");
    setFile(undefined);
    setReply(null);
    setPendingId(undefined);
    setError("");
    setOlderEnd(false);
    if (id)
      void act("conversation", { id, read: true }).catch(
        () => {},
      ); /* Read once on opening, not on every snapshot. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const lastId = chat?.messages.at(-1)?.id;
  useEffect(() => {
    if (preview || !id) return;
    let current = true;
    fetch("/api/messages?id=" + id, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("This conversation could not load.");
        return r.json();
      })
      .then((messages) => {
        if (current)
          setData((d) => ({
            ...d,
            conversations: d.conversations.map((c) =>
              c.id === id ? { ...c, messages } : c,
            ),
          }));
      })
      .catch(() =>
        toast("Messages couldn’t load. Check your connection and try again."),
      );
    return () => {
      current = false;
    };
  }, [id, preview, setData, toast]);
  useEffect(() => {
    scroll.current?.scrollTo({
      top: scroll.current.scrollHeight,
      behavior: "instant",
    });
  }, [lastId]);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!chat || (!text.trim() && !file)) return;
    setSending(true);
    setError("");
    try {
      let messageId = pendingId;
      if (!messageId) {
        const r = await act("message", {
          conversation_id: chat.id,
          body: text,
          reply_to: reply?.id || null,
        });
        messageId = r.id;
        setPendingId(messageId);
      }
      if (file && messageId)
        await upload(file, "message", messageId, caption, setProgress);
      setText("");
      setFile(undefined);
      setCaption("");
      setReply(null);
      setPendingId(undefined);
      setProgress(0);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Message could not be sent. Retry when you’re connected.",
      );
    } finally {
      setSending(false);
    }
  }
  async function older() {
    if (!chat) return;
    setLoadingOlder(true);
    try {
      if (preview) {
        setOlderEnd(true);
        return;
      }
      const r = await fetch(
        "/api/messages?id=" +
          chat.id +
          "&before=" +
          encodeURIComponent(
            chat.messages[0]
              ? cursor(chat.messages[0].created_at, chat.messages[0].id)
              : "",
          ),
        { cache: "no-store" },
      );
      const out = await r.json();
      if (!r.ok) throw new Error(out.error);
      setData((d) => ({
        ...d,
        conversations: d.conversations.map((c) =>
          c.id === chat.id ? { ...c, messages: [...out, ...c.messages] } : c,
        ),
      }));
      setOlderEnd(out.length < 50);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not load older messages.");
    } finally {
      setLoadingOlder(false);
    }
  }
  return (
    <div className={"messaging-layout " + (id ? "chat-selected" : "")}>
      <section className="conversation-list">
        <div className="messages-heading">
          <div>
            <span className="eyebrow muted">ONE CONVERSATION AT A TIME</span>
            <h1>
              Messages<span className="pink-text">.</span>
            </h1>
          </div>
          <Link
            className="icon-button"
            href={prefix + "/discover"}
            aria-label="Find a new connection"
          >
            <Icon name="edit" />
          </Link>
        </div>
        <label className="inline-search">
          <Icon name="search" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search conversations"
            placeholder="Find a conversation"
          />
        </label>
        <div className="conversation-tabs">
          <button
            className={!archived ? "active" : ""}
            onClick={() => setArchived(false)}
          >
            Conversations
          </button>
          <button
            className={archived ? "active" : ""}
            onClick={() => setArchived(true)}
          >
            Archived
          </button>
        </div>
        <div className="chat-list">
          {chats.map((c) => {
            const last = c.messages.at(-1);
            const unread =
              c.unread_count ??
              c.messages.filter(
                (m) =>
                  m.sender_id !== data.me.id &&
                  (!c.last_read_at || m.created_at > c.last_read_at),
              ).length;
            return (
              <Link
                key={c.id}
                className={"chat-list-item " + (c.id === id ? "active" : "")}
                href={prefix + "/messages/" + c.id}
              >
                <Avatar person={c.other} />
                <div>
                  <span>
                    <strong>{c.other.display_name}</strong>
                    <small>{last ? timeAgo(last.created_at) : "New"}</small>
                  </span>
                  <p>
                    {c.muted && <Icon name="mute" size={12} />}{" "}
                    {last
                      ? "A private conversation"
                      : "A little hello starts here."}
                  </p>
                </div>
                {unread > 0 && (
                  <b
                    className="chat-unread-count"
                    aria-label={unread + " unread messages"}
                  >
                    {unread}
                  </b>
                )}
              </Link>
            );
          })}
          {!chats.length && (
            <Empty
              icon="message"
              title={
                archived
                  ? "No archived conversations."
                  : "Room for a little hello."
              }
            >
              <p>Conversations open after a request is accepted.</p>
              <Link href={prefix + "/discover"} className="text-link">
                Find a connection <Icon name="arrow" size={15} />
              </Link>
            </Empty>
          )}
        </div>
        <div className="chat-privacy-note">
          <Icon name="lock" size={16} />
          <span>
            Your pace. Mutual consent.
            <small>Access-controlled, not end-to-end encrypted.</small>
          </span>
        </div>
      </section>
      {chat ? (
        <section
          className="chat-pane"
          aria-label={"Conversation with " + chat.other.display_name}
        >
          <header className="chat-header">
            <Link
              className="icon-button chat-back"
              href={prefix + "/messages"}
              aria-label="Back to conversations"
            >
              <Icon name="left" />
            </Link>
            <Link
              className="chat-person"
              href={prefix + "/u/" + chat.other.username}
            >
              <Avatar person={chat.other} />
              <span>
                <strong>{chat.other.display_name}</strong>
                <small>A space for the two of you</small>
              </span>
            </Link>
            <ActionMenu>
              <summary aria-label="Conversation controls">
                <Icon name="more" />
              </summary>
              <div>
                <button
                  onClick={() =>
                    void act("conversation", {
                      id: chat.id,
                      muted: !chat.muted,
                    }).catch(() => {})
                  }
                >
                  <Icon name="mute" size={15} />
                  {chat.muted ? "Unmute" : "Mute"} notifications
                </button>
                <button
                  onClick={() =>
                    void act("conversation", {
                      id: chat.id,
                      archived: !chat.archived,
                    })
                      .then(() => router.push(prefix + "/messages"))
                      .catch(() => {})
                  }
                >
                  <Icon name="bookmark" size={15} />
                  {chat.archived ? "Unarchive" : "Archive"}
                </button>
                <button onClick={() => setBlock(true)}>
                  <Icon name="eye-off" size={15} /> Block account
                </button>
                <button
                  onClick={() =>
                    setReport({ type: "profile", id: chat.other.id })
                  }
                >
                  <Icon name="flag" size={15} /> Report profile
                </button>
                <button onClick={() => setEnd(true)}>
                  <Icon name="logout" size={15} /> End conversation
                </button>
              </div>
            </ActionMenu>
          </header>
          <div className="chat-scroll" ref={scroll}>
            <div className="conversation-start">
              <span>
                <Icon name="heart-handshake" size={22} />
              </span>
              <h3>A mutual yes. A new beginning.</h3>
              <p>
                Be kind. Ask before giving advice. Share only what feels right.
              </p>
            </div>
            {!olderEnd && chat.messages.length > 0 && (
              <button
                className="older-messages"
                onClick={older}
                disabled={loadingOlder}
              >
                {loadingOlder ? "Loading…" : "Load earlier messages"}
              </button>
            )}
            <div className="message-list">
              {chat.messages.map((m) => {
                const mine = m.sender_id === data.me.id;
                const original = chat.messages.find((x) => x.id === m.reply_to);
                return (
                  <div
                    key={m.id}
                    className={"message-row " + (mine ? "mine" : "")}
                  >
                    {!mine && <Avatar person={chat.other} size="sm" />}
                    <div className="message-block">
                      <div className="message-bubble">
                        {original && (
                          <div className="message-reply-preview">
                            <Icon name="reply" size={12} />
                            <span>
                              {original.body.slice(0, 100) || "Shared media"}
                            </span>
                          </div>
                        )}
                        {m.body && <p>{m.body}</p>}
                        {!!m.media?.length && (
                          <MediaGallery items={m.media} compact />
                        )}
                      </div>
                      <div className="message-meta">
                        <time dateTime={m.created_at}>
                          {new Date(m.created_at).toLocaleTimeString(
                            undefined,
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </time>
                        {mine && (
                          <span>
                            {preview ? (
                              "Saved in preview"
                            ) : chat.other_read_at &&
                              chat.other_read_at >= m.created_at ? (
                              <>
                                <Icon name="read" size={12} /> Read
                              </>
                            ) : (
                              <>
                                <Icon name="check" size={12} /> Sent
                              </>
                            )}
                          </span>
                        )}
                        <button
                          aria-label="Reply to message"
                          onClick={() => setReply(m)}
                        >
                          <Icon name="reply" size={13} />
                        </button>
                        <button
                          aria-label="Send support to message"
                          onClick={() =>
                            void act("message_reaction", { id: m.id }).catch(
                              () => {},
                            )
                          }
                        >
                          <Icon name="heart" size={13} />
                          {m.reactions?.length || ""}
                        </button>
                        <button
                          aria-label="Report message"
                          onClick={() =>
                            setReport({ type: "message", id: m.id })
                          }
                        >
                          <Icon name="flag" size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="message-composer-wrap">
            {reply && (
              <div className="replying-to">
                <Icon name="reply" size={14} /> Replying to:{" "}
                {reply.body.slice(0, 70) || "Shared media"}
                <button
                  aria-label="Cancel reply"
                  onClick={() => setReply(null)}
                >
                  ×
                </button>
              </div>
            )}
            {file && (
              <div className="message-attachment">
                <Icon
                  name={file.type.startsWith("image") ? "image" : "video"}
                  size={18}
                />
                <span>{file.name}</span>
                <button
                  className="icon-button"
                  onClick={() => {
                    setFile(undefined);
                    setPendingId(undefined);
                  }}
                  disabled={sending}
                  aria-label="Remove attachment"
                >
                  ×
                </button>
                <Field label="Attachment caption">
                  <input
                    value={caption}
                    maxLength={300}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="A little context (optional)"
                  />
                </Field>
              </div>
            )}
            {sending && file && (
              <div
                className="upload-progress"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: progress + "%" }} />
                <small>{progress}% · Uploading & validating</small>
              </div>
            )}
            {error && (
              <div className="form-error" role="alert">
                {error} Your attachment stays selected for retry.
              </div>
            )}
            <SupportNote text={text} />
            <form className="message-composer" onSubmit={send}>
              <label
                className="icon-button file-label"
                aria-label="Attach photo or video"
              >
                <Icon name="plus" size={22} />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  disabled={sending}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (
                        ![
                          "image/jpeg",
                          "image/png",
                          "image/webp",
                          "video/mp4",
                          "video/webm",
                        ].includes(f.type) ||
                        f.size >
                          (f.type.startsWith("image") ? 10 : 50) * 1024 * 1024
                      ) {
                        setError(
                          "Choose an image under 10 MB or MP4/WebM under 50 MB.",
                        );
                        return;
                      }
                      setFile(f);
                      setError("");
                    }
                  }}
                />
              </label>
              <textarea
                aria-label="Message"
                placeholder="A little hello, a thought, a listening ear…"
                rows={1}
                value={text}
                maxLength={4000}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    if (!sending) e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <Button
                type="submit"
                disabled={sending || (!text.trim() && !file)}
                aria-label={error ? "Retry message" : "Send message"}
              >
                {sending ? (
                  <Icon name="loader" className="spin" size={18} />
                ) : (
                  <Icon name={error ? "retry" : "send"} size={18} />
                )}
              </Button>
            </form>
            <p className="message-footer">
              Photos & videos are private to this conversation. Read receipts
              are optional.
            </p>
          </div>
        </section>
      ) : (
        <section className="chat-placeholder">
          <div className="placeholder-orbits">
            <Icon name="message" size={44} />
          </div>
          <span className="eyebrow muted">REAL PEOPLE. LITTLE MOMENTS.</span>
          <h2>
            Sometimes, a hello
            <br />
            changes the whole day.
          </h2>
          <p>
            {id
              ? "This conversation is no longer available. It may have ended, or access may have changed."
              : "Choose a conversation, or start with a shared experience."}
          </p>
          <Link className="button secondary" href={prefix + "/discover"}>
            Find your people <Icon name="arrow" size={17} />
          </Link>
          <small>
            <Icon name="lock" size={13} /> No conversations without mutual
            consent.
          </small>
        </section>
      )}
      <ReportDialog target={report} onClose={() => setReport(null)} />
      <BlockDialog
        person={
          block && chat
            ? { id: chat.other.id, name: chat.other.display_name }
            : null
        }
        onClose={() => {
          setBlock(false);
          router.push(prefix + "/messages");
        }}
      />
      <Modal
        open={end}
        onClose={() => setEnd(false)}
        title="End this conversation?"
      >
        <p>
          You’ll both lose access to this conversation and its media. This
          action doesn’t recall previously downloaded files.
        </p>
        <Button
          variant="danger"
          onClick={async () => {
            if (!chat) return;
            try {
              await act("conversation", { id: chat.id, end: true });
              setEnd(false);
              router.push(prefix + "/messages");
            } catch {}
          }}
        >
          End conversation
        </Button>
      </Modal>
    </div>
  );
}
