"use client";
import { useState } from "react";
import Link from "next/link";
import { Button, Field, Icon, Modal, Toggle } from "@/components/ui";
import { topics } from "@/lib/topics";
import { Cases } from "./cases";
import { useRouter } from "next/navigation";
import { useApp } from "./app/provider";
export function Settings() {
  const { data, act, preview, toast } = useApp();
  const router = useRouter();
  const [s, setS] = useState(data.settings);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deactivate, setDeactivate] = useState(false);
  const [error, setError] = useState("");
  const update = (p: Partial<typeof s>) => setS((x) => ({ ...x, ...p }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await act("settings", s);
      toast("Your boundaries have been saved.");
    } catch {
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="settings-page">
      <div className="page-heading">
        <span className="eyebrow muted">YOUR SPACE, YOUR WAY</span>
        <h1>
          A few <span>boundaries.</span>
        </h1>
        <p>Choose what feels comfortable. You can change your mind anytime.</p>
      </div>
      <form onSubmit={save}>
        <section className="settings-section">
          <div className="settings-section-heading">
            <Icon name="eye" />
            <div>
              <h2>Visibility & connection</h2>
              <p>You choose who can find you and what they can see.</p>
            </div>
          </div>
          <Toggle
            label="Appear in discovery"
            detail="Suggestions use only shared preferences. No inferred topics or message contents."
            checked={s.discovery}
            onChange={(v) => update({ discovery: v })}
          />
          <Toggle
            label="Share selected topics for matching"
            detail="These topics become visible on your discovery card. Membership lists stay private."
            checked={s.show_topics}
            onChange={(v) => update({ show_topics: v })}
          />
          <Toggle
            label="Visible member profile"
            detail="Display name, username, bio, and avatar. Never your email or private settings."
            checked={s.profile_visible}
            onChange={(v) => update({ profile_visible: v })}
          />
          <Toggle
            label="Accept new connection requests"
            detail="Pause new hellos without ending your existing conversations."
            checked={s.accept_requests}
            onChange={(v) => update({ accept_requests: v })}
          />
          <Toggle
            label="Read receipts"
            detail="Let people in accepted conversations see when you’ve read their messages."
            checked={s.read_receipts}
            onChange={(v) => update({ read_receipts: v })}
          />
        </section>
        <section className="settings-section">
          <div className="settings-section-heading">
            <Icon name="bell" />
            <div>
              <h2>A little quiet</h2>
              <p>
                Notification contents stay discreet. No message text in alerts.
              </p>
            </div>
          </div>
          <Toggle
            label="In-app message notifications"
            detail="Muting a conversation overrides this preference."
            checked={s.notifications}
            onChange={(v) => update({ notifications: v })}
          />
          <div className="form-grid">
            <Field label="Quiet hours begin (UTC)">
              <input
                type="time"
                value={s.quiet_start.slice(0, 5)}
                onChange={(e) => update({ quiet_start: e.target.value })}
              />
            </Field>
            <Field label="Quiet hours end (UTC)">
              <input
                type="time"
                value={s.quiet_end.slice(0, 5)}
                onChange={(e) => update({ quiet_end: e.target.value })}
              />
            </Field>
          </div>
          <Toggle
            label="Reduce motion"
            detail="Simpler transitions and no ambient animation. Your device preference is also respected."
            checked={s.reduce_motion}
            onChange={(v) => update({ reduce_motion: v })}
          />
        </section>
        <section className="settings-section">
          <div className="settings-section-heading">
            <Icon name="mute" />
            <div>
              <h2>Topics & blocked accounts</h2>
              <p>Make room for what you want to see.</p>
            </div>
          </div>
          <Field label="Muted topics">
            <div className="muted-topics">
              {topics.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  aria-pressed={s.muted_topics.includes(t.slug)}
                  className={s.muted_topics.includes(t.slug) ? "selected" : ""}
                  onClick={() =>
                    update({
                      muted_topics: s.muted_topics.includes(t.slug)
                        ? s.muted_topics.filter((x) => x !== t.slug)
                        : [...s.muted_topics, t.slug],
                    })
                  }
                >
                  <Icon
                    name={s.muted_topics.includes(t.slug) ? "mute" : t.icon}
                    size={14}
                  />
                  {t.short}
                </button>
              ))}
            </div>
          </Field>
          {data.blocks.length ? (
            data.blocks.map((id, i) => (
              <div className="blocked-account" key={id}>
                <span>
                  Blocked account {i + 1}
                  <small>Identity hidden to preserve distance.</small>
                </span>
                <Button
                  variant="secondary"
                  type="button"
                  className="small"
                  onClick={() =>
                    void act("block", { target_id: id, unblock: true }).catch(
                      () => {},
                    )
                  }
                >
                  Unblock
                </Button>
              </div>
            ))
          ) : (
            <p className="fine-print">
              No blocked accounts. You’re in control of your space.
            </p>
          )}
        </section>
        <div className="settings-save">
          <span>
            <Icon name="lock" size={14} /> These choices are private.
          </span>
          <Button disabled={busy}>
            {busy ? "Saving…" : "Save my preferences"}
            <Icon name="check" size={16} />
          </Button>
        </div>
      </form>
      <section className="settings-section">
        <div className="settings-section-heading">
          <Icon name="shield" />
          <div>
            <h2>Account & your data</h2>
            <p>Clear choices. No hidden exits.</p>
          </div>
        </div>
        <Link href="/forgot-password" className="settings-link">
          <span>
            Change your password
            <small>Send a secure reset link to your email.</small>
          </span>
          <Icon name="arrow" size={18} />
        </Link>
        <button
          className="settings-link"
          onClick={async () => {
            if (preview) {
              const blob = new Blob(
                [
                  JSON.stringify(
                    { notice: "FICTIONAL PREVIEW DATA ONLY", ...data },
                    null,
                    2,
                  ),
                ],
                { type: "application/json" },
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "sritedu-fictional-preview.json";
              a.click();
              URL.revokeObjectURL(url);
            } else {
              try {
                const r = await fetch("/api/account");
                if (!r.ok) throw new Error("Export unavailable. Please retry.");
                const url = URL.createObjectURL(await r.blob());
                const a = document.createElement("a");
                a.href = url;
                a.download = "sritedu-data.json";
                a.click();
                URL.revokeObjectURL(url);
              } catch (e) {
                toast(e instanceof Error ? e.message : "Export failed.");
              }
            }
          }}
        >
          <span>
            Export your data
            <small>
              Download your account information and authored text as JSON.
            </small>
          </span>
          <Icon name="download" size={18} />
        </button>
        <button className="settings-link" onClick={() => setDeactivate(true)}>
          <span>
            Deactivate your account
            <small>
              Hide your profile and disable access. Contact support to
              reactivate.
            </small>
          </span>
          <Icon name="eye-off" size={18} />
        </button>
        <button
          className="settings-link delete-link"
          onClick={() => {
            setDeleting(true);
            setError("");
          }}
        >
          <span>
            Delete your account
            <small>
              Remove your account, authored content, and memberships.
            </small>
          </span>
          <Icon name="trash" size={18} />
        </button>
      </section>
      <Cases accountId={data.me.id} preview={preview} />
      <p className="fine-print">
        Storage deletion is asynchronous through retryable jobs. Resolved
        moderation evidence expires after 90 days when scheduled cleanup runs.
        Downloaded copies cannot be recalled.{" "}
        <Link href="/privacy">Read the privacy draft.</Link>
      </p>
      <Modal
        open={deleting}
        onClose={() => setDeleting(false)}
        title="A clear exit, if you need it"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              if (preview) {
                toast("Preview only. No real account was deleted.");
                setDeleting(false);
                return;
              }
              const fields = Object.fromEntries(new FormData(e.currentTarget));
              const r = await fetch("/api/account", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields),
              });
              const out = await r.json();
              if (!r.ok) throw new Error(out.error);
              router.push("/");
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Deletion failed.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <p>
            Deletion removes your account and authored content from member
            access. Media is queued for deletion. Limited reported evidence may
            remain for moderation review under the retention policy.
          </p>
          <Field label="Confirm your password">
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <Field label="Type DELETE to confirm">
            <input
              name="confirmation"
              required
              pattern="DELETE"
              placeholder="DELETE"
              autoComplete="off"
            />
          </Field>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button variant="danger" disabled={busy}>
            Delete my account
          </Button>
        </form>
      </Modal>
      <Modal
        open={deactivate}
        onClose={() => setDeactivate(false)}
        title="Take the space you need"
      >
        <p>
          Your profile, discovery, and access will be disabled. Your records
          remain stored. Reactivation requires the platform operator; no
          response time is guaranteed.
        </p>
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await act("deactivate", {});
              if (!preview) {
                router.push("/");
                router.refresh();
              } else setDeactivate(false);
            } catch {}
          }}
        >
          Deactivate account
        </Button>
      </Modal>
    </div>
  );
}
