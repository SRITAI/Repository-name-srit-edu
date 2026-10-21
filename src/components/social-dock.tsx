"use client";

import { useId } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/ui";

type SocialDockProps = {
  path?: string;
  prefix?: string;
  username?: string;
  onCreate?: () => void;
  unreadMessages?: number;
  reduceMotion?: boolean;
};

export function SocialDock({
  path = "",
  prefix = "",
  username,
  onCreate,
  unreadMessages = 0,
  reduceMotion = false,
}: SocialDockProps) {
  const id = useId();
  const systemReducedMotion = useReducedMotion();
  const reduced = reduceMotion || !!systemReducedMotion;
  const items = [
    { path: "/home", icon: "home", label: "Feed", count: 0 },
    { path: "/communities", icon: "compass", label: "Categories", count: 0 },
    { path: "create", icon: "plus", label: "Share post", count: 0 },
    {
      path: "/messages",
      icon: "message",
      label: "Messages",
      count: unreadMessages,
    },
    {
      path: username ? "/u/" + username : "/sign-in",
      icon: "user",
      label: "Profile",
      count: 0,
    },
  ];
  return (
    <nav
      className="social-dock"
      aria-label={onCreate ? "Social navigation" : "Community shortcuts"}
      data-reduced-motion={reduced ? "true" : undefined}
    >
      {items.map((item) => {
        const create = item.path === "create";
        const active =
          !create &&
          !!path &&
          ("/" + path === item.path ||
            (item.path !== "/sign-in" &&
              ("/" + path).startsWith(item.path + "/")));
        const content = (
          <>
            {active && (
              <motion.span
                className="dock-active-pill"
                layoutId={id + "-dock-active"}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 32 }
                }
              />
            )}
            <span className={create ? "dock-create-icon" : "dock-icon"}>
              <Icon name={item.icon} size={create ? 24 : 21} />
              {item.count > 0 && (
                <b className="dock-badge" aria-hidden="true">
                  {item.count > 9 ? "9+" : item.count}
                </b>
              )}
            </span>
            <span className="dock-label">{item.label}</span>
          </>
        );
        return create && onCreate ? (
          <button
            key={item.path}
            className="dock-item dock-create"
            onClick={onCreate}
            aria-label="Share post"
            aria-haspopup="dialog"
          >
            {content}
          </button>
        ) : (
          <Link
            key={item.path}
            className={
              "dock-item" +
              (create ? " dock-create" : "") +
              (active ? " active" : "")
            }
            href={create ? "/sign-up" : prefix + item.path}
            aria-current={active ? "page" : undefined}
            aria-label={
              item.label + (item.count ? ", " + item.count + " unread" : "")
            }
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
