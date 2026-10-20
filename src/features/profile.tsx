"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Button, Empty, Field, Icon, Modal } from "@/components/ui";
import { ActionMenu } from "@/components/ui";
import type { Post, Profile as ProfileType } from "@/lib/types";
import { useApp } from "./app/provider";
import { PostCard } from "./posts/post-card";
import { MediaGallery } from "./posts/media";
import { Onboarding } from "./onboarding";
import { BlockDialog, ReportDialog } from "./app/safety";
export function Profile({
  username,
  person,
  posts: externalPosts,
}: {
  username: string;
  person?: ProfileType | null;
  posts?: Post[];
}) {
  const { data, act, upload, preview, toast } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState("Stories");
  const [edit, setEdit] = useState(false);
  const [request, setRequest] = useState(false);
  const [note, setNote] = useState("");
  const [block, setBlock] = useState(false);
  const [report, setReport] = useState<{ type: string; id: string } | null>(
    null,
  );
  const prefix = preview ? "/preview" : "";
  const own = username === data.me.username;
  const profile = own
    ? data.me
    : person ||
      data.people.find((p) => p.username === username) ||
      data.conversations.find((c) => c.other.username === username)?.other;
  const posts = own
    ? data.posts.filter((p) => p.author_id === data.me.id)
    : externalPosts || data.posts.filter((p) => p.author_id === profile?.id);
  const connection = data.connections.find((c) =>
    [c.requester_id, c.recipient_id].includes(profile?.id || ""),
  );
  if (!profile || data.blocks.includes(profile.id))
    return (
      <Empty icon="lock" title="This profile isn’t available.">
        <p>The member may have chosen to keep their profile private.</p>
      </Empty>
    );
  return (
    <div className="profile-page">
      <div className="profile-cover">
        <span />
        <span />
        <span />
        <div className="profile-cover-text">
          A work in progress. A person who belongs.
        </div>
      </div>
      <div className="profile-details">
        <Avatar person={profile} size="xl" />
        <div className="profile-controls">
          {own ? (
            <>
              <Link
                className="icon-button"
                href={prefix + "/settings"}
                aria-label="Profile settings"
              >
                <Icon name="settings" />
              </Link>
              <Button
                variant="secondary"
                className="small"
                onClick={() => setEdit(true)}
              >
                <Icon name="edit" size={15} /> Edit profile
              </Button>
            </>
          ) : (
            <>
              <ActionMenu>
                <summary aria-label="Profile actions">
                  <Icon name="more" />
                </summary>
                <div>
                  <button
                    onClick={() =>
                      setReport({ type: "profile", id: profile.id })
                    }
                  >
                    <Icon name="flag" size={15} /> Report profile
                  </button>
                  <button onClick={() => setBlock(true)}>
                    <Icon name="eye-off" size={15} /> Block account
                  </button>
                </div>
              </ActionMenu>
              {connection ? (
                <span className="connection-status">
                  <Icon name="check" size={16} />
                  {connection.status === "accepted"
                    ? "Connected"
                    : "Request " + connection.status}
                </span>
              ) : data.people.some((p) => p.id === profile.id) ? (
                <Button className="small" onClick={() => setRequest(true)}>
                  <Icon name="plus" size={15} /> Connect
                </Button>
              ) : (
                <span className="fine-print">Not accepting new requests</span>
              )}
            </>
          )}
        </div>
        <h1>
          {profile.display_name}
          <span className="profile-bloom">✷</span>
        </h1>
        <p className="username">@{profile.username}</p>
        <p className="profile-bio">
          {profile.bio || "Taking life one little step at a time."}
        </p>
        {own && (
          <span className="profile-privacy">
            <Icon name="lock" size={13} /> Your selected topics are{" "}
            {data.settings.show_topics ? "shared for matching" : "private"}.
            Discovery is {data.settings.discovery ? "on" : "paused"}.
          </span>
        )}
      </div>
      <div className="profile-tabs pill-tabs">
        {["Stories", "Life journey", "Media"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="profile-posts">
        {tab === "Media" ? (
          <>
            {posts.some((p) => p.media?.length) ? (
              <MediaGallery items={posts.flatMap((p) => p.media || [])} />
            ) : (
              <Empty icon="image" title="Room for a little of your world.">
                <p>
                  Shared photos and videos will be here, respecting each story’s
                  audience.
                </p>
              </Empty>
            )}
          </>
        ) : (
          <>
            {posts
              .filter(
                (p) =>
                  p.audience !== "draft" &&
                  (tab !== "Life journey" ||
                    p.journey_id ||
                    posts.some((x) => x.journey_id === p.id)),
              )
              .sort((a, b) =>
                tab === "Life journey"
                  ? a.created_at.localeCompare(b.created_at)
                  : b.created_at.localeCompare(a.created_at),
              )
              .map((p) => (
                <div
                  className={tab === "Life journey" ? "journey-entry" : ""}
                  key={p.id}
                >
                  {tab === "Life journey" && (
                    <span className="journey-date">
                      {new Date(p.created_at).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  <PostCard post={p} />
                </div>
              ))}
            {!posts.some(
              (p) =>
                p.audience !== "draft" &&
                (tab !== "Life journey" ||
                  p.journey_id ||
                  posts.some((x) => x.journey_id === p.id)),
            ) && (
              <Empty
                icon={tab === "Life journey" ? "sprout" : "edit"}
                title={
                  tab === "Life journey"
                    ? "Every chapter, at your pace."
                    : "A story still unfolding."
                }
              >
                <p>
                  {own
                    ? "Share a story, then add journey updates from its menu."
                    : "Stories visible to you will appear here."}
                </p>
              </Empty>
            )}
          </>
        )}
      </div>
      {edit && (
        <Modal
          open
          onClose={() => setEdit(false)}
          title="Your little corner"
          wide
        >
          <Onboarding
            me={data.me}
            settings={data.settings}
            editing
            onSave={async (p, photo) => {
              await act("onboard", p);
              if (photo) await upload(photo, "avatar", data.me.id);
              setEdit(false);
              router.replace(prefix + "/u/" + p.username);
              toast("Your profile has been updated.");
            }}
          />
        </Modal>
      )}
      <Modal
        open={request}
        onClose={() => setRequest(false)}
        title={"A hello to " + profile.display_name}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await act("request", { target_id: profile.id, note });
              setRequest(false);
              toast("Connection request sent.");
            } catch {}
          }}
        >
          <Field label="A short introduction">
            <textarea
              required
              rows={4}
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A shared experience, a small hello…"
            />
          </Field>
          <Button>
            Send request <Icon name="arrow" size={17} />
          </Button>
        </form>
      </Modal>
      <BlockDialog
        person={block ? { id: profile.id, name: profile.display_name } : null}
        onClose={() => setBlock(false)}
      />
      <ReportDialog target={report} onClose={() => setReport(null)} />
    </div>
  );
}
