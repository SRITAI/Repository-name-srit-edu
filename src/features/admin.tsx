"use client";
import { useEffect, useState } from "react";
import { Button, Field, Icon, Empty, Modal } from "@/components/ui";
import type { Report, Media } from "@/lib/types";
import { useApp } from "./app/provider";
import { topics } from "@/lib/topics";
import { timeAgo } from "./posts/post-card";
type AdminData = {
  reports: Report[];
  actions: { id: string; action: string; note: string; created_at: string }[];
  communities: {
    slug: string;
    name: string;
    description: string;
    guidelines: string;
    pinned: string;
  }[];
  resources: {
    id: string;
    region: string;
    name: string;
    url: string;
    last_checked: string;
  }[];
  configuration: { storage: boolean; scanning: boolean; moderation: string };
  metrics?: {
    accounts: number;
    stories: number;
    open_reports: number;
    media_objects: number;
    pending_cleanup: number;
  };
};
export function Admin() {
  const { data, act, preview, toast } = useApp();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Reports");
  const [status, setStatus] = useState("open");
  const [selected, setSelected] = useState<Report | null>(null);
  const [evidence, setEvidence] = useState<{
    report: Report;
    media: Media[];
  } | null>(null);
  const [note, setNote] = useState("");
  const [action, setAction] = useState("review");
  const [busy, setBusy] = useState(false);
  async function load() {
    if (preview) {
      setAdmin({
        reports: data.reports,
        actions: [],
        communities: topics.map((t) => ({
          ...t,
          guidelines: "Listen with care. Protect personal details.",
          pinned: "Take your time. Share only what feels comfortable.",
        })),
        resources: [],
        configuration: {
          storage: false,
          scanning: false,
          moderation: "Fictional preview. No real reports or staff.",
        },
      });
      return;
    }
    try {
      const r = await fetch("/api/admin", { cache: "no-store" });
      const out = await r.json();
      if (!r.ok) throw new Error(out.error);
      setAdmin(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Queue unavailable.");
    }
  }
  useEffect(() => {
    void load(); /* Re-fetch after explicit actions. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, data.reports]);
  async function open(r: Report) {
    setSelected(r);
    setEvidence(null);
    setNote("");
    try {
      if (preview) {
        setEvidence({ report: r, media: [] });
        return;
      }
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error);
      setEvidence(out);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Evidence unavailable.");
    }
  }
  if (data.role === "member")
    return (
      <Empty icon="lock" title="A restricted space for community care.">
        <p>Only authorized moderators and administrators can access reports.</p>
      </Empty>
    );
  return (
    <div className="wide-page">
      <div className="page-heading">
        <span className="eyebrow muted">
          RESTRICTED · {data.role.toUpperCase()}
        </span>
        <h1>
          Community <span>care.</span>
        </h1>
        <p>
          Human review, relevant evidence, clear decisions. Every sensitive
          access is audited.
        </p>
      </div>
      <div className="notice">
        <Icon name="shield" />
        <p>{admin?.configuration.moderation || "Loading configuration…"}</p>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="admin-metrics">
        <div>
          <small>Reports in this queue</small>
          <strong>{admin?.reports.length ?? "—"}</strong>
        </div>
        <div>
          <small>Open cases</small>
          <strong>
            {admin?.reports.filter((r) => r.status === "open").length ?? "—"}
          </strong>
        </div>
        <div>
          <small>Private storage</small>
          <strong>
            {admin?.configuration.storage ? "Configured" : "Not configured"}
          </strong>
        </div>
        <div>
          <small>Malware scanning</small>
          <strong>
            {admin?.configuration.scanning ? "Configured" : "Not configured"}
          </strong>
        </div>
      </div>
      {admin?.metrics && (
        <div className="service-metrics">
          <span>{admin.metrics.accounts} accounts</span>
          <span>{admin.metrics.stories} published stories</span>
          <span>{admin.metrics.media_objects} media objects</span>
          <span>{admin.metrics.pending_cleanup} pending cleanup jobs</span>
        </div>
      )}
      <div className="pill-tabs admin-tabs">
        {["Reports", "Communities", "Resources", "Audit log"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "active" : ""}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Reports" && (
        <>
          <label className="admin-filter">
            Status{" "}
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {["open", "reviewing", "resolved", "dismissed", "all"].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
          </label>
          <div className="report-list">
            {admin?.reports
              .filter((r) => status === "all" || r.status === status)
              .map((r) => (
                <button
                  className="report-row"
                  key={r.id}
                  onClick={() => void open(r)}
                >
                  <span className="report-type">
                    <Icon name="flag" size={18} />
                    {r.target_type}
                  </span>
                  <div>
                    <strong>{r.reason}</strong>
                    <small>
                      {timeAgo(r.created_at)} · {r.id.slice(0, 8)}
                    </small>
                  </div>
                  <span className="status-pill">{r.status}</span>
                  <Icon name="right" size={16} />
                </button>
              ))}
            {admin &&
              !admin.reports.some(
                (r) => status === "all" || r.status === status,
              ) && (
                <Empty icon="shield" title="No cases in this view.">
                  <p>
                    New reports will appear here. A quiet queue does not imply
                    continuous monitoring.
                  </p>
                </Empty>
              )}
          </div>
        </>
      )}
      {tab === "Communities" &&
        admin?.communities.map((c) => (
          <form
            key={c.slug}
            className="settings-section"
            onSubmit={async (e) => {
              e.preventDefault();
              const p = Object.fromEntries(new FormData(e.currentTarget));
              try {
                if (preview) {
                  toast(
                    "Fictional preview. Live community edits require Supabase.",
                  );
                  return;
                }
                await act("community_edit", { ...p, slug: c.slug });
                toast("Community information updated.");
                await load();
              } catch {}
            }}
          >
            <h2>{c.name}</h2>
            <Field label="Description">
              <textarea
                name="description"
                defaultValue={c.description}
                maxLength={1000}
                required
              />
            </Field>
            <Field label="Community guidelines">
              <textarea
                name="guidelines"
                defaultValue={c.guidelines}
                maxLength={3000}
                required
              />
            </Field>
            <Field label="Pinned moderator note">
              <textarea
                name="pinned"
                defaultValue={c.pinned}
                maxLength={1000}
                required
              />
            </Field>
            <Button className="small">Save community</Button>
          </form>
        ))}
      {tab === "Resources" && (
        <>
          <form
            className="settings-section"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const p = Object.fromEntries(new FormData(form));
              try {
                if (preview) {
                  toast(
                    "Fictional preview. Resources require live verification and storage.",
                  );
                  return;
                }
                await act("resource", p);
                form.reset();
                await load();
                toast("Verified resource saved.");
              } catch {}
            }}
          >
            <h2>Add a verified resource</h2>
            <p className="muted">
              Verify the source yourself. Entries expire from member views after
              180 days without a fresh check.
            </p>
            <div className="form-grid">
              <Field label="Region">
                <input name="region" required placeholder="India / Worldwide" />
              </Field>
              <Field label="Resource name">
                <input name="name" required />
              </Field>
            </div>
            <Field label="Resource URL">
              <input name="url" type="url" required pattern="https://.*" />
            </Field>
            <Field label="Verification source URL">
              <input
                name="source_url"
                type="url"
                required
                pattern="https://.*"
              />
            </Field>
            <Field label="Date checked">
              <input
                name="last_checked"
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
              />
            </Field>
            <Button>Save verified resource</Button>
          </form>
          {admin?.resources.map((r) => (
            <div className="resource-item" key={r.id}>
              <Icon name="help" />
              <div>
                <strong>{r.name}</strong>
                <p>
                  {r.region} · Checked {r.last_checked}
                </p>
                <a href={r.url} target="_blank" rel="noreferrer">
                  Open source <Icon name="arrow" size={14} />
                </a>
              </div>
            </div>
          ))}
        </>
      )}
      {tab === "Audit log" && (
        <div className="audit-list">
          {admin?.actions.map((a) => (
            <div key={a.id}>
              <Icon name="shield" size={17} />
              <span>
                <strong>{a.action.replaceAll("_", " ")}</strong>
                <p>{a.note}</p>
                <small>{new Date(a.created_at).toLocaleString()}</small>
              </span>
            </div>
          ))}
          {!admin?.actions.length && (
            <Empty icon="shield" title="The next action leaves a record.">
              <p>
                Role changes, evidence access, and moderation decisions are
                audited here.
              </p>
            </Empty>
          )}
        </div>
      )}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Review reported evidence"
        wide
      >
        {selected && (
          <>
            <div className="case-meta">
              <span className="status-pill">{selected.target_type}</span>
              <span className="status-pill">{selected.status}</span>
              <small>Case {selected.id}</small>
            </div>
            <h3>Report reason</h3>
            <p>{selected.reason}</p>
            <h3>Relevant evidence</h3>
            {evidence ? (
              <div className="evidence-box">
                <p>
                  {String(
                    evidence.report.evidence?.body ||
                      "No text snapshot available for this report.",
                  )}
                </p>
                {evidence.media?.map((m) => (
                  <div key={m.id}>
                    {m.kind === "video" ? (
                      <video
                        controls
                        playsInline
                        src={"/api/media/" + m.id + "?case=" + selected.id}
                      />
                    ) : (
                      <img
                        alt={m.caption || "Reported media"}
                        src={"/api/media/" + m.id + "?case=" + selected.id}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Loading authorized evidence…</p>
            )}
            <p className="fine-print">
              Only this reported item is shown. No access to unrelated private
              conversations.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  if (
                    ["remove", "restore_account"].includes(action) &&
                    !preview
                  ) {
                    const r = await fetch("/api/admin", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        id: selected.id,
                        mode: action,
                        note,
                      }),
                    });
                    const out = await r.json();
                    if (!r.ok) throw new Error(out.error);
                  } else
                    await act("moderate", { id: selected.id, action, note });
                  setSelected(null);
                  await load();
                  toast("Decision saved to the audit log.");
                } catch {
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Field label="Decision">
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  <option value="review">Mark as reviewing</option>
                  <option value="resolve">Resolve case</option>
                  <option value="dismiss">Dismiss report</option>
                  {["post", "comment", "message", "media"].includes(
                    selected.target_type,
                  ) && <option value="remove">Remove reported content</option>}
                  {["post", "appeal"].includes(selected.target_type) && (
                    <>
                      <option value="restore">
                        Restore reported post / appeal
                      </option>
                    </>
                  )}
                  {data.role === "admin" &&
                    selected.target_type === "appeal" && (
                      <option value="restore_account">
                        Restore account after appeal
                      </option>
                    )}
                  {data.role === "admin" && (
                    <option value="suspend">Suspend reported author</option>
                  )}
                </select>
              </Field>
              <Field label="Reason for this action">
                <textarea
                  required
                  minLength={5}
                  maxLength={2000}
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Field>
              <Button disabled={busy || !evidence}>
                Save decision <Icon name="check" size={16} />
              </Button>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
}
