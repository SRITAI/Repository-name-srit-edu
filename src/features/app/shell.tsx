"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Logo, Icon, Avatar, Button } from "@/components/ui";
import { useApp } from "./provider";
import { Composer } from "../posts/composer";
const navigation = [
  { path: "/home", label: "Home", icon: "home" },
  { path: "/communities", label: "Communities", icon: "users" },
  { path: "/discover", label: "Discover people", icon: "compass" },
  { path: "/messages", label: "Messages", icon: "message" },
  { path: "/notifications", label: "Notifications", icon: "bell" },
  { path: "/profile", label: "My profile", icon: "user" },
];
export function AppShell({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const { data, preview, toast } = useApp();
  const [create, setCreate] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const prefix = preview ? "/preview" : "";
  const unread = data.notifications.filter((n) => !n.read).length;
  const title = path.startsWith("communities/")
    ? "Your community"
    : path.startsWith("messages")
      ? "Messages"
      : path.startsWith("u/")
        ? "Your people"
        : path.startsWith("post/")
          ? "A shared story"
          : (
              {
                home: "Your space",
                communities: "Communities",
                discover: "Discover people",
                notifications: "Notifications",
                settings: "Settings",
                admin: "Community care",
                profile: "My profile",
              } as Record<string, string>
            )[path] || "Your space";
  async function signOut() {
    if (preview) {
      router.push("/");
      return;
    }
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "sign-out" }),
      });
      if (!r.ok) throw new Error();
      router.push("/");
      router.refresh();
    } catch {
      toast("Could not sign out. Please retry.");
    }
  }
  return (
    <div className="app-layout" data-preview={preview ? "true" : undefined}>
      {preview && (
        <div className="preview-banner">
          <span>
            <Icon name="eye" size={13} /> <b>Fictional preview</b>
            <span className="preview-detail">
              {" "}
              · Changes stay in this browser session. No real accounts.
            </span>
          </span>
          <Link href="/sign-up">
            Create a real account <Icon name="arrow" size={13} />
          </Link>
        </div>
      )}
      <aside className="sidebar">
        <Logo />
        <div className="sidebar-caption">A LITTLE LESS ALONE</div>
        <nav aria-label="Application navigation">
          {navigation.map((n) => {
            const href =
              n.path === "/profile" ? "/u/" + data.me.username : n.path;
            const active =
              path === n.path.slice(1) ||
              path.startsWith(n.path.slice(1) + "/") ||
              (n.path === "/profile" && path === "u/" + data.me.username);
            return (
              <Link
                key={n.path}
                className={active ? "nav-link active" : "nav-link"}
                href={prefix + href}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="nav-active-bg"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon name={n.icon} />
                <span>{n.label}</span>
                {n.path === "/notifications" && unread > 0 && (
                  <b className="nav-badge">{unread}</b>
                )}
              </Link>
            );
          })}
        </nav>
        <Button className="sidebar-create" onClick={() => setCreate(true)}>
          <Icon name="plus" size={18} /> Share your story
        </Button>
        <div className="sidebar-bottom">
          <nav aria-label="Account and support">
            <Link
              className={"nav-link " + (path === "settings" ? "active" : "")}
              href={prefix + "/settings"}
            >
              <Icon name="settings" /> Settings
            </Link>
            <Link className="nav-link" href="/help">
              <Icon name="help" /> Help & support
            </Link>
            {data.role !== "member" && (
              <Link
                className={"nav-link " + (path === "admin" ? "active" : "")}
                href={prefix + "/admin"}
              >
                <Icon name="shield" /> Community care
              </Link>
            )}
          </nav>
          <div className="sidebar-note">
            <span>✷</span>
            <p>
              You belong here.<small>Even on the in-between days.</small>
            </p>
          </div>
          <div className="sidebar-account">
            <Link href={prefix + "/u/" + data.me.username}>
              <Avatar person={data.me} size="sm" />
              <span>
                <strong>{data.me.display_name}</strong>
                <small>@{data.me.username}</small>
              </span>
            </Link>
            <button
              className="icon-button"
              onClick={signOut}
              aria-label={preview ? "Exit preview" : "Sign out"}
            >
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="app-topbar">
          <div className="mobile-brand">
            <Logo />
          </div>
          <span className="topbar-breadcrumb">
            Your little corner <Icon name="right" size={12} /> <b>{title}</b>
          </span>
          <form
            className="app-search"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(prefix + "/home?q=" + encodeURIComponent(search));
            }}
          >
            <Icon name="search" size={16} />
            <input
              aria-label="Search stories"
              placeholder="Find a familiar feeling…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <kbd>↵</kbd>
          </form>
          <div className="topbar-actions">
            <Link
              href={prefix + "/notifications"}
              className="icon-button notification-bell"
              aria-label={
                "Notifications" + (unread ? ", " + unread + " unread" : "")
              }
            >
              <Icon name="bell" size={19} />
              {unread > 0 && <span />}
            </Link>
            <Link
              href={prefix + "/u/" + data.me.username}
              aria-label="My profile"
            >
              <Avatar person={data.me} size="sm" />
            </Link>
          </div>
        </header>
        <main
          id="main"
          className={
            "app-main " + (path.startsWith("messages") ? "messages-main" : "")
          }
        >
          {children}
        </main>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {[
          { path: "/home", icon: "home", label: "Home" },
          { path: "/communities", icon: "users", label: "Spaces" },
          { path: "create", icon: "plus", label: "Share" },
          { path: "/messages", icon: "message", label: "Messages" },
          { path: "/u/" + data.me.username, icon: "user", label: "Profile" },
        ].map((n) =>
          n.path === "create" ? (
            <button
              key={n.path}
              className="mobile-create"
              onClick={() => setCreate(true)}
              aria-label="Create a story"
            >
              <span>
                <Icon name="plus" size={23} />
              </span>
              <small>Share</small>
            </button>
          ) : (
            <Link
              href={prefix + n.path}
              key={n.path}
              className={("/" + path).startsWith(n.path) ? "active" : ""}
            >
              <Icon name={n.icon} size={21} />
              <small>{n.label}</small>
            </Link>
          ),
        )}
      </nav>
      {create && <Composer open onClose={() => setCreate(false)} />}
    </div>
  );
}
