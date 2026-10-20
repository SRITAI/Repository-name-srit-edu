"use client";
import { useState } from "react";
import { Modal, Button, Field, Icon } from "@/components/ui";
import { useApp } from "./provider";
export function ReportDialog({
  target,
  onClose,
}: {
  target: { type: string; id: string } | null;
  onClose: () => void;
}) {
  const { act, busy, toast } = useApp();
  const [reason, setReason] = useState("");
  return (
    <Modal
      open={!!target}
      onClose={onClose}
      title={
        target?.type === "appeal" ? "Request a review" : "Help us understand"
      }
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!target) return;
          try {
            await act("report", {
              target_type: target.type,
              target_id: target.id,
              reason,
            });
            toast(
              "Your report has been saved for human review. No response time is guaranteed.",
            );
            setReason("");
            onClose();
          } catch {}
        }}
      >
        <p className="muted">
          Share what concerned you. For messages, only the reported message and
          relevant media are made available to reviewers.
        </p>
        <Field label="Reason for this report">
          <textarea
            required
            minLength={5}
            maxLength={2000}
            rows={5}
            placeholder="Tell us what happened…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <p className="fine-print">
          For immediate danger, contact local emergency services or someone you
          trust. This queue is not monitored around the clock.
        </p>
        <Button disabled={busy} className="full">
          <Icon name="flag" size={17} /> Submit{" "}
          {target?.type === "appeal" ? "appeal" : "report"}
        </Button>
      </form>
    </Modal>
  );
}
export function BlockDialog({
  person,
  onClose,
}: {
  person: { id: string; name: string } | null;
  onClose: () => void;
}) {
  const { act, busy, toast } = useApp();
  return (
    <Modal open={!!person} onClose={onClose} title="Create a little distance">
      <p>
        Block {person?.name}? You’ll stop appearing in each other’s feed and
        discovery. Your conversations will end and new requests will be
        prevented.
      </p>
      <p className="muted">
        You can unblock in Settings. Ended conversations will stay closed.
        Previously downloaded files can’t be recalled.
      </p>
      <Button
        variant="danger"
        disabled={busy}
        className="full"
        onClick={async () => {
          if (!person) return;
          try {
            await act("block", { target_id: person.id });
            toast("Account blocked. You’re in control of your space.");
            onClose();
          } catch {}
        }}
      >
        Block account
      </Button>
    </Modal>
  );
}
