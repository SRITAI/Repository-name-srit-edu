"use client";
import Link from "next/link";
import { Icon, Button, Empty } from "@/components/ui";
import { useApp } from "./app/provider";
import { timeAgo } from "./posts/post-card";
export function Notifications() {
  const { data, act, preview } = useApp();
  return (
    <div className="settings-page">
      <div className="page-heading">
        <span className="eyebrow muted">LITTLE UPDATES FROM YOUR WORLD</span>
        <h1>
          A little <span>heads-up.</span>
        </h1>
        <p>
          Private by default. Message contents never appear in these
          notifications.
        </p>
      </div>
      <div className="notification-toolbar">
        <span>{data.notifications.filter((n) => !n.read).length} unread</span>
        <Button
          variant="ghost"
          className="small"
          onClick={() => void act("read_notifications", {}).catch(() => {})}
        >
          <Icon name="check" size={15} /> Mark all read
        </Button>
      </div>
      <div className="notification-list">
        {data.notifications.map((n) => (
          <Link
            className={"notification-item " + (!n.read ? "unread" : "")}
            href={(preview ? "/preview" : "") + n.href}
            key={n.id}
          >
            <span>
              <Icon
                name={
                  n.href.startsWith("/messages") ? "message" : "heart-handshake"
                }
                size={22}
              />
            </span>
            <div>
              <strong>{n.body}</strong>
              <small>{timeAgo(n.created_at)}</small>
            </div>
            {!n.read && <i />}
            <Icon name="right" size={16} />
          </Link>
        ))}
        {!data.notifications.length && (
          <Empty icon="bell" title="A quiet little moment.">
            <p>Requests and conversation updates will be here.</p>
          </Empty>
        )}
      </div>
    </div>
  );
}
