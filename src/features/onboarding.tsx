"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Icon, Avatar, Toggle } from "@/components/ui";
import { topics, intents } from "@/lib/topics";
import { profileSchema } from "@/lib/schema";
import type { Profile, Settings } from "@/lib/types";
export function Onboarding({
  me,
  settings,
  onSave,
  editing = false,
}: {
  me?: Profile;
  settings?: Settings;
  onSave?: (p: Record<string, unknown>, photo?: File) => Promise<void>;
  editing?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File>();
  const [photoUrl, setPhotoUrl] = useState("");
  const router = useRouter();
  const [form, setForm] = useState({
    display_name: me?.display_name || "",
    username: me?.username || "",
    bio: me?.bio || "",
    avatar: me?.avatar || "bloom",
    language: me?.language || "English",
    intent: me?.intent || "",
    topics: me?.topics || ([] as string[]),
    discovery: settings?.discovery || false,
    show_topics: settings?.show_topics || false,
    profile_visible: settings?.profile_visible ?? true,
    accept_requests: settings?.accept_requests ?? true,
    accepted: false,
  });
  const update = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));
  async function pickPhoto(file?: File) {
    if (!file) return;
    if (
      !/^image\/(jpeg|png|webp)$/.test(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setError("Choose a JPEG, PNG, or WebP under 10 MB.");
      return;
    }
    const image = new window.Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 512;
      const context = canvas.getContext("2d")!;
      const side = Math.min(image.width, image.height);
      context.drawImage(
        image,
        (image.width - side) / 2,
        (image.height - side) / 2,
        side,
        side,
        0,
        0,
        512,
        512,
      );
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setPhoto(new File([blob], "profile.webp", { type: "image/webp" }));
            setPhotoUrl(canvas.toDataURL("image/webp"));
          }
          URL.revokeObjectURL(url);
        },
        "image/webp",
        0.88,
      );
    };
    image.onerror = () => {
      setError("This image could not be opened. Try another file.");
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }
  async function next(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (step === 0) {
      const result = profileSchema
        .pick({ display_name: true, username: true, bio: true })
        .safeParse(form);
      if (!result.success) {
        setError(result.error.issues[0].message);
        return;
      }
    }
    if (step === 1 && !form.topics.length) {
      setError("Choose at least one community. You can change this later.");
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      const validated = profileSchema.parse(form);
      if (onSave) await onSave(validated, photo);
      else {
        const res = await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "onboard", payload: validated }),
        });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error);
        if (photo) {
          const fd = new FormData();
          fd.set("file", photo);
          fd.set("type", "avatar");
          fd.set("id", "self");
          const upload = await fetch("/api/upload", {
            method: "POST",
            body: fd,
          });
          if (!upload.ok)
            throw new Error(
              "Profile saved. Your photo didn’t upload; retry in Edit profile.",
            );
        }
        router.push("/home");
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please review your choices.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="onboarding">
      <div className="onboarding-progress">
        {[
          "Your space",
          "Your communities",
          "Your boundaries",
          "A shared promise",
        ].map((s, i) => (
          <span className={i <= step ? "active" : ""} key={s}>
            <b>{i < step ? "✓" : i + 1}</b>
            <small>{s}</small>
          </span>
        ))}
      </div>
      <form onSubmit={next}>
        <span className="eyebrow muted">
          STEP {step + 1} OF 4 · AT YOUR PACE
        </span>
        <h1>
          {
            [
              "Let’s make this your space.",
              "What brings you here?",
              "Your story. Your boundaries.",
              "A little care goes a long way.",
            ][step]
          }
        </h1>
        <p className="muted">
          {
            [
              "Pseudonyms are welcome. No need for your legal name.",
              "Your choices stay private unless you explicitly share them.",
              "Start with what feels comfortable. Change it anytime.",
              "Help us keep this a respectful space for everyone.",
            ][step]
          }
        </p>
        {step === 0 && (
          <>
            <div className="avatar-picker">
              <Avatar
                person={{ ...me, avatar: photoUrl || form.avatar }}
                size="xl"
              />
              <div className="avatar-choices">
                {["bloom", "orbit", "moon"].map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={
                      "avatar-choice " + (form.avatar === a ? "selected" : "")
                    }
                    aria-label={"Choose " + a + " avatar"}
                    onClick={() => {
                      update({ avatar: a });
                      setPhoto(undefined);
                      setPhotoUrl("");
                    }}
                  >
                    <Avatar person={{ avatar: a, id: a }} />
                  </button>
                ))}
                <label
                  className="icon-button upload-avatar"
                  aria-label="Upload profile photo"
                >
                  <Icon name="image" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => pickPhoto(e.target.files?.[0])}
                  />
                </label>
                <small>
                  Photos are centre-cropped to a square. Or choose an avatar.
                </small>
              </div>
            </div>
            <div className="form-grid">
              <Field label="Display name">
                <input
                  value={form.display_name}
                  onChange={(e) => update({ display_name: e.target.value })}
                  required
                  maxLength={50}
                  placeholder="What should we call you?"
                />
              </Field>
              <Field label="Unique username">
                <input
                  value={form.username}
                  onChange={(e) =>
                    update({
                      username: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_]/g, ""),
                    })
                  }
                  minLength={3}
                  maxLength={24}
                  required
                  placeholder="your_small_corner"
                />
              </Field>
            </div>
            <Field label="A little about you (optional)">
              <textarea
                value={form.bio}
                onChange={(e) => update({ bio: e.target.value })}
                maxLength={300}
                rows={3}
                placeholder="A few words, if you’d like."
              />
            </Field>
          </>
        )}
        {step === 1 && (
          <>
            <div className="topic-picker">
              {topics.map((t) => (
                <button
                  type="button"
                  key={t.slug}
                  aria-pressed={form.topics.includes(t.slug)}
                  className={form.topics.includes(t.slug) ? "selected" : ""}
                  onClick={() =>
                    update({
                      topics: form.topics.includes(t.slug)
                        ? form.topics.filter((s) => s !== t.slug)
                        : [...form.topics, t.slug],
                    })
                  }
                >
                  <Icon name={t.icon} />
                  <span>{t.name}</span>
                  {form.topics.includes(t.slug) && (
                    <Icon name="check" size={16} />
                  )}
                </button>
              ))}
            </div>
            <div className="form-grid">
              <Field label="Language">
                <select
                  value={form.language}
                  onChange={(e) => update({ language: e.target.value })}
                >
                  {["English", "Hindi", "Hinglish"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </Field>
              <Field label="Conversation intent (optional)">
                <select
                  value={form.intent}
                  onChange={(e) => update({ intent: e.target.value })}
                >
                  <option value="">I’ll choose later</option>
                  {intents.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </Field>
            </div>
            <small className="muted">
              Joining keeps your membership private. A post is visible to the
              audience you select.
            </small>
          </>
        )}
        {step === 2 && (
          <>
            <Toggle
              label="Appear in people discovery"
              detail="Let members find you using only preferences you explicitly share."
              checked={form.discovery}
              onChange={(v) => update({ discovery: v })}
            />
            <Toggle
              label="Share my selected topics for matching"
              detail="Off by default. When on, your topics appear on discovery cards and may explain a match."
              checked={form.show_topics}
              onChange={(v) => update({ show_topics: v })}
            />
            <Toggle
              label="Make my profile visible to members"
              detail="Your email and private settings are never part of your profile."
              checked={form.profile_visible}
              onChange={(v) => update({ profile_visible: v })}
            />
            <Toggle
              label="Accept new connection requests"
              detail="A short text request first. Photos and chat only after you both agree."
              checked={form.accept_requests}
              onChange={(v) => update({ accept_requests: v })}
            />
          </>
        )}
        {step === 3 && (
          <>
            <div className="principles">
              {[
                {
                  icon: "heart-handshake",
                  title: "Listen with kindness.",
                  body: "Ask before giving advice. No harassment, sexual solicitation, scams, or exploitation.",
                },
                {
                  icon: "lock",
                  title: "Protect each other’s privacy.",
                  body: "No identifying details about someone else. Respect boundaries and the word no.",
                },
                {
                  icon: "flower",
                  title: "Share experiences, not diagnoses.",
                  body: "Supportive discussion is welcome. No encouragement or instructions for self-harm.",
                },
              ].map((p) => (
                <div key={p.title}>
                  <Icon name={p.icon} />
                  <span>
                    <strong>{p.title}</strong>
                    <p>{p.body}</p>
                  </span>
                </div>
              ))}
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                required
                checked={form.accepted}
                onChange={(e) => update({ accepted: e.target.checked })}
              />
              <span>
                I declare that I’m 18 or older, accept the{" "}
                <a href="/guidelines" target="_blank" rel="noreferrer">
                  community guidelines
                </a>
                ,{" "}
                <a href="/privacy" target="_blank" rel="noreferrer">
                  privacy policy
                </a>
                , and{" "}
                <a href="/terms" target="_blank" rel="noreferrer">
                  terms
                </a>
                . This is self-declared eligibility, not verified age assurance.
              </span>
            </label>
            <div className="notice">
              sritedu is peer support, not clinical treatment or an emergency
              service. Moderation is not monitored 24/7.
            </div>
          </>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="onboarding-actions">
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(step - 1)}
            >
              <Icon name="left" size={16} /> Back
            </Button>
          ) : (
            <span />
          )}
          <Button disabled={busy}>
            {busy
              ? "Saving…"
              : step === 3
                ? editing
                  ? "Save your profile"
                  : "Find my community"
                : "Continue"}
            <Icon name="arrow-right" size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
}
