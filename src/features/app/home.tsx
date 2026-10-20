"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon, Avatar, Button, Empty } from "@/components/ui";
import { topics } from "@/lib/topics";
import { EditorialPhoto } from "@/components/editorial-photo";
import { useApp } from "./provider";
import { PostCard } from "../posts/post-card";
import { Composer } from "../posts/composer";
export function ContextRail() {
  const { data, preview } = useApp();
  const prefix = preview ? "/preview" : "";
  return (
    <aside className="context-rail">
      <section className="dashboard-profile">
        <div className="dashboard-profile-cover">
          <span>YOUR LITTLE CORNER</span>
          <Icon name="flower" size={38} />
        </div>
        <Avatar person={data.me} size="lg" />
        <h2>{data.me.display_name}</h2>
        <span className="profile-handle">@{data.me.username}</span>
        <p>{data.me.bio || "A new chapter, at your own pace."}</p>
        <Link
          href={prefix + "/u/" + data.me.username}
          className="button secondary small"
        >
          View my profile <Icon name="arrow" size={14} />
        </Link>
        <div className="private-summary">
          <span>
            <strong>{data.memberships.length}</strong>Communities
          </span>
          <span>
            <strong>
              {data.connections.filter((c) => c.status === "accepted").length}
            </strong>
            Connections
          </span>
        </div>
        <small className="summary-privacy">
          <Icon name="lock" size={11} /> Only visible to you
        </small>
      </section>
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
        <section className="dashboard-welcome">
          <div className="page-heading">
            <span className="eyebrow">YOUR SPACE TO EXHALE</span>
            <h1>
              A little less alone,
              <br />
              <span>{data.me.display_name.split(" ")[0]}.</span>
            </h1>
            <p>Whatever today looks like, you’re welcome here.</p>
            <button
              className="button primary small"
              onClick={() => setCreate(true)}
            >
              Start a new chapter <Icon name="edit" size={16} />
            </button>
          </div>
          <div className="welcome-photo">
            <EditorialPhoto topic="finding-connection" eager />
            <span>
              <Icon name="heart" size={15} /> You belong here.
            </span>
          </div>
        </section>
        <div className="dashboard-section-heading">
          <div>
            <span className="eyebrow muted">A FAMILIAR FEELING</span>
            <h2>Find your kind of space</h2>
          </div>
          <Link
            className="text-link"
            href={(preview ? "/preview" : "") + "/communities"}
          >
            View all <Icon name="arrow" size={14} />
          </Link>
        </div>
        <div className="dashboard-spaces">
          {["moving-forward", "financial-stress", "emotional-wellbeing"].map(
            (slug) => {
              const topic = topics.find((t) => t.slug === slug)!;
              return (
                <Link
                  key={slug}
                  href={(preview ? "/preview" : "") + "/communities/" + slug}
                  className="dashboard-space"
                >
                  <EditorialPhoto topic={slug} />
                  <span className="space-icon">
                    <Icon name={topic.icon} size={17} />
                  </span>
                  <strong>{topic.short}</strong>
                  <span className="space-link">
                    Find understanding <Icon name="arrow" size={13} />
                  </span>
                </Link>
              );
            },
          )}
        </div>
        <div className="dashboard-section-heading stories-heading">
          <div>
            <span className="eyebrow muted">
              LITTLE MOMENTS. REAL FEELINGS.
            </span>
            <h2>Stories & shared journeys</h2>
          </div>
          <Icon name="sprout" size={22} />
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
