"use client";
import { AppProvider, useApp } from "./provider";
import { AppShell } from "./shell";
import { Home } from "./home";
import { Communities } from "../communities";
import { Discovery } from "../discovery";
import { Messages } from "../messages";
import { Profile } from "../profile";
import { Notifications } from "../notifications";
import { Settings } from "../settings";
import { Admin } from "../admin";
import { Onboarding } from "../onboarding";
import { PostCard } from "../posts/post-card";
import { Button, Empty } from "@/components/ui";
import type { AppData, Post, Profile as ProfileType } from "@/lib/types";
import { useRouter } from "next/navigation";
export function ProductRouter({
  path,
  preview = false,
  initial,
  post,
  person,
  profilePosts,
}: {
  path: string;
  preview?: boolean;
  initial?: AppData;
  post?: Post | null;
  person?: ProfileType | null;
  profilePosts?: Post[];
}) {
  return (
    <AppProvider initial={initial} preview={preview}>
      <AppShell path={path}>
        <Screen
          path={path}
          post={post}
          person={person}
          profilePosts={profilePosts}
        />
      </AppShell>
    </AppProvider>
  );
}
function Screen({
  path,
  person,
  profilePosts,
}: {
  path: string;
  post?: Post | null;
  person?: ProfileType | null;
  profilePosts?: Post[];
}) {
  const { data, preview, act, upload } = useApp();
  const router = useRouter();
  const [page, id] = path.split("/");
  switch (page) {
    case "home":
      return <Home />;
    case "communities":
      return <Communities key={id || "list"} slug={id} />;
    case "discover":
      return <Discovery />;
    case "messages":
      return <Messages id={id} />;
    case "u":
      return <Profile username={id} person={person} posts={profilePosts} />;
    case "notifications":
      return <Notifications />;
    case "settings":
      return <Settings />;
    case "admin":
      return <Admin />;
    case "onboarding":
      return (
        <Onboarding
          me={data.me}
          settings={data.settings}
          onSave={async (p, photo) => {
            await act("onboard", p);
            if (photo) await upload(photo, "avatar", data.me.id);
            router.push((preview ? "/preview" : "") + "/home");
          }}
        />
      );
    case "post": {
      const p = data.posts.find((p) => p.id === id);
      return p ? (
        <div className="single-post">
          <PostCard post={p} expanded />
          <h3 className="journey-heading">Chapters in this journey</h3>
          {data.posts
            .filter(
              (x) => x.journey_id === (p.journey_id || p.id) && x.id !== p.id,
            )
            .sort((a, b) => a.created_at.localeCompare(b.created_at))
            .map((x) => (
              <PostCard key={x.id} post={x} />
            ))}
          {!data.posts.some(
            (x) => x.journey_id === (p.journey_id || p.id) && x.id !== p.id,
          ) && <p className="fine-print">No further chapters shared yet.</p>}
        </div>
      ) : (
        <Empty icon="lock" title="This story isn’t available to you.">
          <p>
            Its audience may be private, or the story may have been removed. A
            copied link doesn’t change access.
          </p>
          <Button
            variant="secondary"
            onClick={() => router.push((preview ? "/preview" : "") + "/home")}
          >
            Back to your space
          </Button>
        </Empty>
      );
    }
    default:
      return <Home />;
  }
}
