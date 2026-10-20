"use client";
import { useState } from "react";
import { Modal, Button, Field, Icon, Avatar, Toggle } from "@/components/ui";
import { SupportNote } from "@/components/support-note";
import { topics } from "@/lib/topics";
import type { Post } from "@/lib/types";
import { useApp } from "../app/provider";
export function Composer({
  open,
  onClose,
  community,
  post,
  journey,
}: {
  open: boolean;
  onClose: () => void;
  community?: string;
  post?: Post;
  journey?: Post;
}) {
  const { data, act, upload, toast } = useApp();
  const [body, setBody] = useState(post?.body || "");
  const [slug, setSlug] = useState(
    post?.community_slug ||
      journey?.community_slug ||
      community ||
      data.memberships[0] ||
      topics[0].slug,
  );
  const [audience, setAudience] = useState(
    post?.audience || journey?.audience || "community",
  );
  const [warning, setWarning] = useState(post?.warning || "");
  const [comments, setComments] = useState(post?.comments_enabled ?? true);
  const [hideCounts, setHideCounts] = useState(post?.hide_counts ?? false);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState(post?.id);
  const [uploaded, setUploaded] = useState<number[]>([]);
  async function save(draft = false) {
    setBusy(true);
    setError("");
    try {
      if (!body.trim())
        throw new Error(
          "A few words are enough. Add a thought before sharing.",
        );
      if (!data.memberships.includes(slug))
        await act("membership", { slug, joined: true });
      const payload = {
        body,
        community_slug: slug,
        audience: draft ? "draft" : audience,
        warning,
        comments_enabled: comments,
        hide_counts: hideCounts,
        journey_id: journey?.journey_id || journey?.id || null,
      };
      let id = savedId;
      if (!id) {
        const result = await act("post", {
          ...payload,
          audience: files.length ? "draft" : payload.audience,
        });
        id = result.id;
        setSavedId(id);
      }
      if (!id) throw new Error("Unable to save your story. Please retry.");
      for (let i = 0; i < files.length; i++) {
        if (uploaded.includes(i)) continue;
        await upload(files[i], "post", id, caption, (n) =>
          setProgress(Math.round(((i + n / 100) / files.length) * 100)),
        );
        setUploaded((x) => [...x, i]);
      }
      await act("post", { ...payload, id });
      toast(
        draft || audience === "draft"
          ? "Draft saved. Only you can see it."
          : "Your story has a place here. Thanks for sharing.",
      );
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Your draft is safe. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  function choose(list: FileList | null) {
    if (!list) return;
    const added = Array.from(list);
    if (files.length + added.length > 6) {
      setError("Choose up to 6 photos or videos per post.");
      return;
    }
    for (const f of added) {
      if (
        ![
          "image/jpeg",
          "image/png",
          "image/webp",
          "video/mp4",
          "video/webm",
        ].includes(f.type)
      ) {
        setError("Choose JPEG, PNG, WebP, MP4, or WebM files.");
        return;
      }
      if (f.size > (f.type.startsWith("image") ? 10 : 50) * 1024 * 1024) {
        setError(
          `${f.name} exceeds the ${f.type.startsWith("image") ? "10" : "50"} MB limit.`,
        );
        return;
      }
    }
    setFiles((x) => [...x, ...added]);
    setError("");
  }
  return (
    <Modal
      open={open}
      onClose={() => {
        if (!busy) onClose();
      }}
      title={
        post
          ? "Edit your story"
          : journey
            ? "A new chapter in your journey"
            : "A little of your world"
      }
    >
      <div className="composer-person">
        <Avatar person={data.me} />
        <div>
          <strong>{data.me.display_name}</strong>
          <small>You choose how much to share.</small>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <textarea
          className="story-textarea"
          aria-label="Your story"
          placeholder="What’s on your mind? A small win, a hard day, a thought you’ve been carrying…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={10000}
          rows={6}
          required
        />
        <SupportNote text={body} />
        <div className="composer-tools">
          <label className="text-link file-label">
            <Icon name="image" size={19} /> Add photos / video
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              onChange={(e) => choose(e.target.files)}
              disabled={busy}
            />
          </label>
          <span className="fine-print">
            {body.length.toLocaleString()} / 10,000
          </span>
        </div>
        {files.length > 0 && (
          <div className="upload-files">
            {files.map((f, i) => (
              <div key={i}>
                <Icon
                  name={f.type.startsWith("image") ? "image" : "video"}
                  size={16}
                />
                <span>{f.name}</span>
                {uploaded.includes(i) ? (
                  <Icon name="check" size={16} />
                ) : (
                  <button
                    type="button"
                    className="icon-button"
                    disabled={busy}
                    aria-label={"Remove " + f.name}
                    onClick={() => setFiles((x) => x.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <Field label="Media caption / description">
              <input
                maxLength={300}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe what you’re sharing"
              />
            </Field>
          </div>
        )}
        <div className="form-grid">
          <Field label="Community">
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!!post || !!journey}
            >
              {topics.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Who can see this?">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as Post["audience"])}
            >
              <option value="community">Community members</option>
              <option value="connections">Accepted connections only</option>
              <option value="draft">Private draft · only me</option>
            </select>
          </Field>
        </div>
        <div className="audience-note">
          <Icon name="lock" size={15} />
          {audience === "community"
            ? "Visible to signed-in members of this community."
            : audience === "connections"
              ? "Visible only to your accepted connections."
              : "Only you can see this draft."}{" "}
          Sharing a link preserves this audience.
        </div>
        <Field label="Content note (optional)">
          <input
            value={warning}
            onChange={(e) => setWarning(e.target.value)}
            placeholder="Give others a gentle heads-up"
            maxLength={120}
          />
        </Field>
        <Toggle
          label="Allow comments"
          checked={comments}
          onChange={setComments}
        />
        <Toggle
          label="Hide reaction counts"
          checked={hideCounts}
          onChange={setHideCounts}
        />
        {busy && files.length > 0 && (
          <div
            className="upload-progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: progress + "%" }} />
            <small>
              {progress < 90 ? "Uploading" : "Validating & saving"} · {progress}
              %
            </small>
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
            {savedId &&
              " Your text is saved as a private draft. Retry to finish."}
          </p>
        )}
        <div className="composer-footer">
          <Button
            variant="ghost"
            type="button"
            disabled={busy}
            onClick={() => save(true)}
          >
            Save draft
          </Button>
          <Button type="submit" disabled={busy}>
            {busy
              ? "Saving…"
              : post
                ? "Save changes"
                : audience === "draft"
                  ? "Save private draft"
                  : "Share your story"}
            <Icon name="arrow" size={17} />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
