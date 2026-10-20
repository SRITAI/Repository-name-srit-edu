"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Icon, Avatar, Button, Modal } from "@/components/ui";
import { ActionMenu } from "@/components/ui";
import { topics } from "@/lib/topics";
import type { Post, Comment } from "@/lib/types";
import { useApp } from "../app/provider";
import { ReportDialog, BlockDialog } from "../app/safety";
import { MediaGallery } from "./media";
import { Composer } from "./composer";
export function timeAgo(value: string) {
  const d = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
  return d < 1
    ? "Just now"
    : d < 60
      ? `${d}m ago`
      : d < 1440
        ? `${Math.floor(d / 60)}h ago`
        : new Date(value).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
}
export function PostCard({
  post,
  expanded = false,
}: {
  post: Post;
  expanded?: boolean;
}) {
  const { data, act, preview, toast } = useApp();
  const [showComments, setShowComments] = useState(expanded);
  const [comment, setComment] = useState("");
  const [reply, setReply] = useState<Comment | null>(null);
  const [sending, setSending] = useState(false);
  const [revealed, setRevealed] = useState(!post.warning);
  const [report, setReport] = useState<{ type: string; id: string } | null>(
    null,
  );
  const [block, setBlock] = useState(false);
  const [edit, setEdit] = useState(false);
  const [journey, setJourney] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const prefix = preview ? "/preview" : "";
  const mine = post.author_id === data.me.id;
  const topic = topics.find((t) => t.slug === post.community_slug);
  const reaction = post.reactions?.find((r) => r.user_id === data.me.id);
  const comments = post.comments || [];
  function author(c: Comment) {
    return (
      c.author || {
        id: c.author_id,
        display_name: "Community member",
        avatar: "bloom",
        username: "member",
        bio: "",
      }
    );
  }
  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await act("comment", {
        post_id: post.id,
        body: comment,
        parent_id: reply?.id || null,
      });
      setComment("");
      setReply(null);
    } catch {
    } finally {
      setSending(false);
    }
  }
  const renderComment = (c: Comment) => (
    <div
      className={"comment " + (c.parent_id ? "reply-comment" : "")}
      key={c.id}
    >
      <Avatar person={author(c)} size="sm" />
      <div className="comment-content">
        <div>
          <Link href={prefix + "/u/" + author(c).username}>
            {author(c).display_name}
          </Link>
          <small>{timeAgo(c.created_at)}</small>
          <ActionMenu>
            <summary aria-label="Comment actions">
              <Icon name="more" size={16} />
            </summary>
            <div>
              {c.author_id === data.me.id ? (
                <button
                  onClick={() =>
                    void act("delete_comment", { id: c.id }).catch(() => {})
                  }
                >
                  <Icon name="trash" size={14} /> Delete
                </button>
              ) : (
                <button
                  onClick={() => setReport({ type: "comment", id: c.id })}
                >
                  <Icon name="flag" size={14} /> Report
                </button>
              )}
            </div>
          </ActionMenu>
        </div>
        <p>{c.body}</p>
        {!c.parent_id && post.comments_enabled && (
          <button className="comment-reply" onClick={() => setReply(c)}>
            Reply
          </button>
        )}
      </div>
    </div>
  );
  return (
    <motion.article
      className="post-card"
      layout
      initial={{ opacity: 1, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="post-meta">
        <Link
          className="post-author"
          href={prefix + "/u/" + (post.author?.username || "member")}
        >
          <Avatar person={post.author} />
          <span>
            <strong>{post.author?.display_name || "Community member"}</strong>
            <small>
              {timeAgo(post.created_at)}
              <span>·</span>
              <Icon
                name={post.audience === "community" ? "users" : "lock"}
                size={11}
              />
              {post.audience === "draft"
                ? "Private draft"
                : post.audience === "connections"
                  ? "Connections"
                  : "Community"}
            </small>
          </span>
        </Link>
        <ActionMenu>
          <summary aria-label="Story actions">
            <Icon name="more" />
          </summary>
          <div>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    window.location.origin + prefix + "/post/" + post.id,
                  );
                  toast("Link copied. Its audience stays protected.");
                } catch {
                  toast("Open the story to copy its address.");
                }
              }}
            >
              <Icon name="link" size={15} /> Copy link
            </button>
            {mine ? (
              <>
                <button onClick={() => setEdit(true)}>
                  <Icon name="edit" size={15} /> Edit story
                </button>
                <button onClick={() => setJourney(true)}>
                  <Icon name="sprout" size={15} /> Add journey update
                </button>
                <button onClick={() => setDeleting(true)}>
                  <Icon name="trash" size={15} /> Delete story
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setReport({ type: "post", id: post.id })}
                >
                  <Icon name="flag" size={15} /> Report story
                </button>
                <button onClick={() => setBlock(true)}>
                  <Icon name="eye-off" size={15} /> Block account
                </button>
              </>
            )}
          </div>
        </ActionMenu>
      </div>
      <Link
        href={prefix + "/communities/" + post.community_slug}
        className="post-community"
      >
        <Icon name={topic?.icon || "flower"} size={13} />
        {topic?.name}
      </Link>
      {post.journey_id && (
        <Link
          href={prefix + "/post/" + post.journey_id}
          className="journey-label"
        >
          <Icon name="sprout" size={13} /> A chapter in a life journey{" "}
          <Icon name="arrow" size={12} />
        </Link>
      )}
      {!revealed ? (
        <div className="content-warning">
          <Icon name="eye-off" size={24} />
          <strong>Content note: {post.warning}</strong>
          <p>Take a moment to decide what feels right for you.</p>
          <Button variant="secondary" onClick={() => setRevealed(true)}>
            Show story
          </Button>
        </div>
      ) : (
        <>
          <p className="post-body">{post.body}</p>
          {!!post.media?.length && <MediaGallery items={post.media} />}
        </>
      )}
      <div className="post-actions">
        <div className="reaction-picker">
          <button
            className={reaction ? "reacted" : ""}
            onClick={() =>
              void act("reaction", {
                id: post.id,
                reaction: reaction?.kind || "I hear you",
              }).catch(() => {})
            }
            aria-pressed={!!reaction}
          >
            <motion.span
              key={reaction?.kind}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <Icon name="heart" size={19} />
            </motion.span>
            <span>{reaction?.kind || "I hear you"}</span>
            {!post.hide_counts && !!post.reactions?.length && (
              <b>{post.reactions.length}</b>
            )}
          </button>
          <button
            className="reaction-toggle"
            aria-label="Choose a supportive reaction"
            aria-expanded={reactionsOpen}
            onClick={() => setReactionsOpen(!reactionsOpen)}
          >
            <Icon name="down" size={12} />
          </button>
          {reactionsOpen && (
            <div className="reaction-options">
              {["I hear you", "Sending support", "Thank you for sharing"].map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => {
                      void act("reaction", { id: post.id, reaction: r }).catch(
                        () => {},
                      );
                      setReactionsOpen(false);
                    }}
                  >
                    <Icon
                      name={
                        r === "I hear you"
                          ? "heart"
                          : r === "Sending support"
                            ? "heart-handshake"
                            : "flower"
                      }
                      size={16}
                    />
                    {r}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          aria-expanded={showComments}
        >
          <Icon name="message" size={18} />
          <span>
            {comments.length
              ? comments.length + " comments"
              : "Leave a little care"}
          </span>
        </button>
        <button
          className={
            "bookmark-button " +
            (data.bookmarks.includes(post.id) ? "bookmarked" : "")
          }
          aria-label={
            data.bookmarks.includes(post.id)
              ? "Remove bookmark"
              : "Bookmark story"
          }
          aria-pressed={data.bookmarks.includes(post.id)}
          onClick={() => void act("bookmark", { id: post.id }).catch(() => {})}
        >
          <Icon name="bookmark" size={19} />
        </button>
      </div>
      {showComments && (
        <div className="comments-section">
          {comments
            .filter((c) => !c.parent_id)
            .map((c) => (
              <div key={c.id}>
                {renderComment(c)}
                {comments
                  .filter((r) => r.parent_id === c.id)
                  .map(renderComment)}
              </div>
            ))}
          {post.comments_enabled ? (
            <form onSubmit={submitComment} className="comment-form">
              {reply && (
                <div className="replying-to">
                  Replying to {author(reply).display_name}
                  <button
                    type="button"
                    aria-label="Cancel reply"
                    onClick={() => setReply(null)}
                  >
                    ×
                  </button>
                </div>
              )}
              <Avatar person={data.me} size="sm" />
              <input
                aria-label="Write a supportive comment"
                placeholder="A few kind words…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                maxLength={2000}
              />
              <button
                className="icon-button"
                type="submit"
                disabled={sending || !comment.trim()}
                aria-label="Send comment"
              >
                <Icon name="send" size={18} />
              </button>
            </form>
          ) : (
            <p className="fine-print">
              The author has turned comments off for this story.
            </p>
          )}
        </div>
      )}
      <ReportDialog target={report} onClose={() => setReport(null)} />
      <BlockDialog
        person={
          block
            ? {
                id: post.author_id,
                name: post.author?.display_name || "this member",
              }
            : null
        }
        onClose={() => setBlock(false)}
      />
      {edit && <Composer open onClose={() => setEdit(false)} post={post} />}{" "}
      {journey && (
        <Composer open onClose={() => setJourney(false)} journey={post} />
      )}
      <Modal
        open={deleting}
        onClose={() => setDeleting(false)}
        title="Delete this story?"
      >
        <p>
          Your story, comments, and media will be removed from member access.
          Storage cleanup runs through a retryable job. Limited reported
          evidence may be retained for review.
        </p>
        <Button
          variant="danger"
          onClick={async () => {
            try {
              await act("delete_post", { id: post.id });
              setDeleting(false);
              toast("Story deleted.");
            } catch {}
          }}
        >
          Delete story
        </Button>
      </Modal>
    </motion.article>
  );
}
