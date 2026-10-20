"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon, Avatar, Button, Empty } from "@/components/ui";
import { topics } from "@/lib/topics";
import { useApp } from "./provider";
import { PostCard } from "../posts/post-card";
import { Composer } from "../posts/composer";
export function ContextRail() {
  const { data, preview } = useApp();
  const prefix = preview ? "/preview" : "";
  return (
    <aside className="context-rail">
      <div className="gentle-reminder">
        <span className="eyebrow">A GENTLE REMINDER</span>
        <div className="reminder-flower">✷</div>
        <h3>
          You’re allowed
          <br />
          to take your time.
        </h3>
        <p>
          Some days, showing up is enough.
          <br />
          Today can be one of those days.
        </p>
        <span className="reminder-line" />
      </div>
      <div className="rail-section">
        <div className="rail-heading">
          <h3>Your communities</h3>
          <Link href={prefix + "/communities"} aria-label="Explore communities">
            <Icon name="plus" size={16} />
          </Link>
        </div>
        {data.memberships.length ? (
          data.memberships.map((slug) => {
            const t = topics.find((x) => x.slug === slug);
            return (
              t && (
                <Link
                  className="rail-community"
                  href={prefix + "/communities/" + slug}
                  key={slug}
                >
                  <span>
                    <Icon name={t.icon} size={18} />
                  </span>
                  <div>
                    <strong>{t.short}</strong>
                    <small>{t.prompt}</small>
                  </div>
                  <Icon name="right" size={13} />
                </Link>
              )
            );
          })
        ) : (
          <p className="muted small-text">
            A familiar feeling is a good place to start.
          </p>
        )}
      </div>
      <div className="rail-section">
        <div className="rail-heading">
          <h3>A shared experience</h3>
          <Icon name="heart-handshake" size={16} />
        </div>
        <p className="muted small-text">
          Connection happens at your pace. A short hello, then a mutual yes.
        </p>
        <Link className="text-link" href={prefix + "/discover"}>
          Find your people <Icon name="arrow" size={15} />
        </Link>
      </div>
      <div className="rail-help">
        <Icon name="help" size={20} />
        <div>
          <strong>Need a little more support?</strong>
          <p>You don’t have to carry it alone.</p>
          <Link href="/help">
            Find support resources <Icon name="arrow" size={12} />
          </Link>
        </div>
      </div>
      <div className="rail-footer">
        <Link href="/privacy">Privacy</Link>
        <Link href="/guidelines">Guidelines</Link>
        <Link href="/terms">Terms</Link>
        <span>© {new Date().getFullYear()} sritedu ♡</span>
      </div>
    </aside>
  );
}
export function Home() {
  const { data, preview, hasMore, loadMore } = useApp();
  const [tab, setTab] = useState("Newest");
  const [create, setCreate] = useState(false);
  const params = useSearchParams();
  const query = params.get("q")?.toLowerCase() || "";
  const connected = data.connections
    .filter((c) => c.status === "accepted")
    .map((c) =>
      c.requester_id === data.me.id ? c.recipient_id : c.requester_id,
    );
  const posts = data.posts.filter(
    (p) =>
      !data.settings.muted_topics.includes(p.community_slug) &&
      !data.blocks.includes(p.author_id) &&
      (tab === "Drafts" ? p.audience === "draft" : p.audience !== "draft") &&
      (tab !== "My communities" ||
        data.memberships.includes(p.community_slug)) &&
      (tab !== "Connections" ||
        connected.includes(p.author_id) ||
        p.author_id === data.me.id) &&
      (tab !== "Saved" || data.bookmarks.includes(p.id)) &&
      (!query || p.body.toLowerCase().includes(query)),
  );
  return (
    <div className="feed-layout">
      <section className="feed-column">
        <div className="page-heading">
          <span className="eyebrow muted">YOUR SPACE TO EXHALE</span>
          <h1>
            A little less alone,{" "}
            <span>{data.me.display_name.split(" ")[0]}.</span>
          </h1>
          <p>Whatever today looks like, you’re welcome here.</p>
        </div>
        <div className="welcome-note">
          <span>✷</span>
          <p>You don’t have to have it all together to belong here.</p>
          <Icon name="heart" size={18} />
        </div>
        <div className="feed-composer">
          <div>
            <Avatar person={data.me} />
            <button onClick={() => setCreate(true)}>
              What’s on your mind, {data.me.display_name.split(" ")[0]}?
            </button>
          </div>
          <footer>
            <button onClick={() => setCreate(true)}>
              <Icon name="edit" size={17} /> Share a thought
            </button>
            <button onClick={() => setCreate(true)}>
              <Icon name="image" size={17} /> Photo / video
            </button>
            <button onClick={() => setCreate(true)}>
              <Icon name="sprout" size={17} /> Life journey
            </button>
            <Icon name="lock" size={13} />
          </footer>
        </div>
        <div className="feed-filter" aria-label="Filter stories">
          {["Newest", "My communities", "Connections", "Saved", "Drafts"].map(
            (t) => (
              <button
                key={t}
                aria-pressed={t === tab}
                className={t === tab ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ),
          )}
          <Icon name="filter" size={16} />
        </div>
        {query && (
          <div className="search-results">
            Stories containing “{params.get("q")}”{" "}
            <Link href={(preview ? "/preview" : "") + "/home"}>
              Clear search
            </Link>
          </div>
        )}
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {!posts.length && (
            <Empty
              title={
                tab === "Drafts"
                  ? "Your unwritten chapters."
                  : tab === "Saved"
                    ? "Keep a story close."
                    : "A little quiet, for now."
              }
              icon={tab === "Saved" ? "bookmark" : "flower"}
            >
              <p>
                {tab === "Drafts"
                  ? "Private drafts live here. Take all the time you need."
                  : tab === "Saved"
                    ? "Bookmark a story to come back to it."
                    : "Join a community or be the first to share a thought."}
              </p>
              <Button variant="secondary" onClick={() => setCreate(true)}>
                Share a little of your world <Icon name="plus" size={16} />
              </Button>
            </Empty>
          )}
          {hasMore && (
            <Button
              variant="secondary"
              className="load-more"
              onClick={() => void loadMore()}
            >
              Load more stories <Icon name="down" size={16} />
            </Button>
          )}
          {posts.length > 0 && !hasMore && (
            <div className="feed-end">
              <span>✷</span> You’re all caught up. Take a little moment for
              yourself.
            </div>
          )}
        </div>
      </section>
      <ContextRail />
      {create && <Composer open onClose={() => setCreate(false)} />}
    </div>
  );
}
