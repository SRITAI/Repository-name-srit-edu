"use client";
import { useEffect, useState, useCallback } from "react";
import type { Report } from "@/lib/types";
import { Button, Field, Modal, Icon } from "@/components/ui";
export function Cases({
  accountId,
  preview = false,
}: {
  accountId: string;
  preview?: boolean;
}) {
  const [cases, setCases] = useState<{
    reports: Report[];
    removed: { id: string; body: string }[];
  }>({ reports: [], removed: [] });
  const [target, setTarget] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (preview) return;
    try {
      const r = await fetch("/api/cases", { cache: "no-store" });
      if (r.ok) setCases(await r.json());
    } catch {
      setError("Your reports could not load. Please retry.");
    }
  }, [preview]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <section className="settings-section">
      <div className="settings-section-heading">
        <Icon name="shield" />
        <div>
          <h2>Your reports & appeals</h2>
          <p>Follow a report or ask for a human review.</p>
        </div>
      </div>
      {cases.reports.map((r) => (
        <div className="own-case" key={r.id}>
          <span>
            {r.target_type} · {r.reason}
            <small>{new Date(r.created_at).toLocaleDateString()}</small>
          </span>
          <b className="status-pill">{r.status}</b>
        </div>
      ))}
      {!cases.reports.length && (
        <p className="fine-print" style={{ margin: "17px 0" }}>
          No reports submitted in this view.
        </p>
      )}
      {cases.removed.map((p) => (
        <div className="own-case" key={p.id}>
          <span>
            Removed story<small>{p.body.slice(0, 100)}</small>
          </span>
          <Button
            variant="secondary"
            className="small"
            onClick={() => {
              setTarget(p.id);
              setReason("");
              setError("");
            }}
          >
            Appeal
          </Button>
        </div>
      ))}
      <button
        className="text-link"
        style={{ marginTop: 15 }}
        onClick={() => {
          setTarget(accountId);
          setReason("");
          setError("");
        }}
      >
        Ask for an account review <Icon name="arrow" size={15} />
      </button>
      {notice && (
        <p className="fine-print" role="status" style={{ marginTop: 15 }}>
          {notice}
        </p>
      )}
      {error && <p className="form-error">{error}</p>}
      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Ask for a fresh look"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              if (!preview) {
                const r = await fetch("/api/cases", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ target_id: target, reason }),
                });
                const out = await r.json();
                if (!r.ok) throw new Error(out.error);
              }
              setNotice(
                preview
                  ? "Fictional preview. No real appeal was submitted."
                  : "Your appeal is saved for human review. No response time is guaranteed.",
              );
              setTarget(null);
              await load();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Please retry.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="muted">
            Tell us what you’d like reviewed. No need to include private
            identifying details.
          </p>
          <Field label="Your reason for appeal">
            <textarea
              required
              minLength={5}
              maxLength={2000}
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <Button disabled={busy}>Submit appeal</Button>
        </form>
      </Modal>
    </section>
  );
}
