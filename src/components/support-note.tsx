import Link from "next/link";
import { Icon } from "./ui";
export function SupportNote({ text }: { text: string }) {
  if (
    !/kill myself|end my life|immediate danger|hurt myself right now/i.test(
      text,
    )
  )
    return null;
  return (
    <aside className="notice" aria-label="Additional support">
      <Icon name="heart-handshake" size={18} />
      <span>
        If things feel immediately unsafe, consider contacting local emergency
        services or someone you trust.{" "}
        <Link href="/help" target="_blank">
          Find support in your region <Icon name="arrow" size={12} />
        </Link>
        <small className="support-note-detail">
          This optional prompt is local to your screen. It does not notify a
          responder or change discovery.
        </small>
      </span>
    </aside>
  );
}
