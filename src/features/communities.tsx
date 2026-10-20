"use client";
import Link from "next/link";
import { useState } from "react";
import { topics, communityGuidelines } from "@/lib/topics";
import { Icon, Button, Empty } from "@/components/ui";
import { useApp } from "./app/provider";
import { ContextRail } from "./app/home";
import { Composer } from "./posts/composer";
import { PostCard } from "./posts/post-card";
export function Communities({ slug }: { slug?: string }) {
  const { data, act, preview } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All communities");
  const [create, setCreate] = useState(false);
  const [postFilter, setPostFilter] = useState("Newest");
  const [guidelines, setGuidelines] = useState(false);
  const prefix = preview ? "/preview" : "";
  const list = topics.map((t) => ({
    ...t,
    ...data.communities?.find((c) => c.slug === t.slug),
  }));
  if (!slug)
    return (
      <div className="wide-page">
        <div className="page-heading">
          <span className="eyebrow muted">
            DIFFERENT STORIES. SHARED HUMANITY.
          </span>
          <h1>
            Find a familiar <span>feeling.</span>
          </h1>
          <p>
            There’s a space for whatever life feels like. You can belong to more
            than one.
          </p>
        </div>
        <div className="community-toolbar">
          <div className="pill-tabs">
            {["All communities", "My communities"].map((f) => (
              <button
                key={f}
                className={f === filter ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="inline-search">
            <Icon name="search" size={16} />
            <input
              aria-label="Search communities"
              placeholder="Find your space…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <div className="app-community-grid">
          {list
            .filter(
              (t) =>
                (filter !== "My communities" ||
                  data.memberships.includes(t.slug)) &&
                (t.name + " " + t.description)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
            )
            .map((t, i) => {
              const joined = data.memberships.includes(t.slug);
              return (
                <article className="app-community-card" key={t.slug}>
                  <Link href={prefix + "/communities/" + t.slug}>
                    <span className={"topic-symbol symbol-" + i}>
                      <Icon name={t.icon} size={29} />
                    </span>
                    <span className="card-arrow">
                      <Icon name="arrow" size={18} />
                    </span>
                    <h2>{t.name}</h2>
                    <p>{t.description}</p>
                  </Link>
                  <div>
                    <span>
                      <Icon name="lock" size={12} /> Private membership
                    </span>
                    <Button
                      variant={joined ? "secondary" : "primary"}
                      className="small"
                      onClick={() =>
                        void act("membership", {
                          slug: t.slug,
                          joined: !joined,
                        }).catch(() => {})
                      }
                    >
                      {joined ? (
                        <>
                          <Icon name="check" size={14} /> Joined
                        </>
                      ) : (
                        <>
                          Join community <Icon name="plus" size={14} />
                        </>
                      )}
                    </Button>
                  </div>
                </article>
              );
            })}
        </div>
        <div className="privacy-note">
          <Icon name="shield" size={20} />
          <p>
            Joining doesn’t publish your membership or selected topics. When you
            post, the audience you choose can see that post. Communities are for
            signed-in adults 18+.
          </p>
        </div>
      </div>
    );
  const t = list.find((t) => t.slug === slug);
  if (!t)
    return (
      <Empty title="This space isn’t here yet.">
        <Link href={prefix + "/communities"}>Explore communities</Link>
      </Empty>
    );
  const joined = data.memberships.includes(slug);
  const posts = data.posts.filter(
    (p) =>
      p.community_slug === slug &&
      p.audience !== "draft" &&
      (postFilter !== "Journeys" || p.journey_id) &&
      (postFilter !== "My stories" || p.author_id === data.me.id),
  );
  return (
    <div className="feed-layout">
      <section className="feed-column">
        <Link className="back-link" href={prefix + "/communities"}>
          <Icon name="left" size={14} /> All communities
        </Link>
        <div className="community-cover">
          <span className="community-cover-orbit" />
          <span className="topic-symbol">
            <Icon name={t.icon} size={36} />
          </span>
          <span className="eyebrow">A SPACE FOR SHARED EXPERIENCES</span>
          <h1>{t.name}</h1>
          <p>{t.description}</p>
          <div>
            <Button
              variant={joined ? "secondary" : "primary"}
              onClick={() =>
                void act("membership", { slug, joined: !joined }).catch(
                  () => {},
                )
              }
            >
              {joined ? (
                <>
                  <Icon name="check" size={16} /> Joined · leave
                </>
              ) : (
                <>
                  Join this community <Icon name="plus" size={16} />
                </>
              )}
            </Button>
            <button
              className="text-link"
              onClick={() => setGuidelines(!guidelines)}
            >
              <Icon name="shield" size={16} /> Community guidelines
            </button>
          </div>
        </div>
        {guidelines && (
          <div className="guidelines-panel">
            <h3>A little care for this space</h3>
            <p>{t.guidelines || communityGuidelines}</p>
            <p>
              {t.slug === "financial-stress"
                ? "No lending, sales, fundraising, or investment pitches."
                : t.slug === "relationships"
                  ? "Respect boundaries. No identifying details or sexual solicitation."
                  : "Protect identifying details. Respect the pace and boundaries of others."}
            </p>
          </div>
        )}
        <div className="pinned-note">
          <Icon name="shield" size={20} />
          <div>
            <span className="eyebrow muted">A NOTE FROM COMMUNITY CARE</span>
            <p>
              {t.pinned ||
                "Take your time. Share only what feels comfortable. This is peer support, not clinical care."}{" "}
              <Link href="/help">Help is here if you need it.</Link>
            </p>
          </div>
        </div>
        {joined ? (
          <>
            <div className="community-feed-toolbar">
              <div className="pill-tabs">
                {["Newest", "Journeys", "My stories"].map((f) => (
                  <button
                    key={f}
                    className={postFilter === f ? "active" : ""}
                    onClick={() => setPostFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <Button className="small" onClick={() => setCreate(true)}>
                <Icon name="plus" size={15} /> Share a story
              </Button>
            </div>
            <div className="post-list">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
              {!posts.length && (
                <Empty title="Every community starts with a story.">
                  <p>A small thought is a lovely place to begin.</p>
                  <Button variant="secondary" onClick={() => setCreate(true)}>
                    Share your story
                  </Button>
                </Empty>
              )}
            </div>
          </>
        ) : (
          <Empty icon="lock" title="A little space, just for members.">
            <p>
              Join to read and share stories. Your membership stays private.
            </p>
            <Button
              onClick={() =>
                void act("membership", { slug, joined: true }).catch(() => {})
              }
            >
              Join this community
            </Button>
          </Empty>
        )}
      </section>
      <ContextRail />
      {create && (
        <Composer open community={slug} onClose={() => setCreate(false)} />
      )}
    </div>
  );
}
