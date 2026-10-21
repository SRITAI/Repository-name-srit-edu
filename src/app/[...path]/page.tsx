import { notFound, redirect } from "next/navigation";
import { Restricted } from "@/features/restricted";
import type { Metadata } from "next";
import { configured, serverClient } from "@/lib/supabase/server";
import { loadData, loadPost } from "@/lib/data";
import { ProductRouter } from "@/features/app/router";
import { AuthForm } from "@/features/auth";
import { Onboarding } from "@/features/onboarding";
import { Info } from "@/features/info";
import { Logo } from "@/components/ui";
import type { Profile, Post, AppData } from "@/lib/types";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const { path } = await params;
  const isPublic = ["help", "guidelines", "privacy", "terms"].includes(path[0]);
  return {
    title:
      path[0] === "help"
        ? "Help & support"
        : path[0][0].toUpperCase() + path[0].slice(1).replaceAll("-", " "),
    robots: { index: isPublic, follow: isPublic },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path: segments } = await params;
  const path = segments.join("/");
  const root = segments[0];
  if (["help", "guidelines", "privacy", "terms"].includes(root)) {
    let resources: AppData["resources"] = [];
    if (root === "help" && configured()) {
      const db = await serverClient();
      const { data } = await db
        .from("resource_entries")
        .select("id,region,name,url,last_checked");
      resources = data || [];
    }
    return <Info page={root} resources={resources} />;
  }
  if (
    ["sign-in", "sign-up", "forgot-password", "reset-password"].includes(root)
  )
    return (
      <AuthForm
        kind={root}
        configured={configured()}
        google={process.env.GOOGLE_AUTH_ENABLED === "true"}
      />
    );
  if (
    ![
      "home",
      "communities",
      "discover",
      "post",
      "messages",
      "u",
      "notifications",
      "settings",
      "onboarding",
      "admin",
    ].includes(root)
  )
    notFound();
  if (!configured()) redirect("/sign-in");
  const db = await serverClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/sign-in");
  const { data: profile } = await db
    .from("community_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile)
    return (
      <div className="onboarding-page">
        <header>
          <Logo />
        </header>
        <main id="main">
          <Onboarding />
        </main>
      </div>
    );
  const { data: status } = await db
    .from("private_profile_settings")
    .select("suspended,deactivated")
    .eq("user_id", user.id)
    .single();
  if (status?.suspended || status?.deactivated)
    return <Restricted id={user.id} suspended={status.suspended} />;
  const initial = await loadData(db);
  let post: Post | null | undefined,
    person: Profile | null | undefined,
    profilePosts: Post[] | undefined;
  if (root === "post" && segments[1]) {
    post = await loadPost(db, segments[1]);
    if (post && !initial.posts.some((p) => p.id === post!.id))
      initial.posts.push(post);
  }
  if (root === "u" && segments[1]) {
    const { data: p } = await db
      .from("community_profiles")
      .select("*")
      .eq("username", segments[1])
      .maybeSingle();
    person = p;
    if (p) {
      const { data: posts } = await db
        .from("posts")
        .select(
          "*,author:community_profiles!posts_author_id_fkey(*),media:post_media(id,kind,caption),reactions(user_id,kind),comments(*,author:community_profiles!comments_author_id_fkey(*))",
        )
        .eq("author_id", p.id)
        .order("created_at", { ascending: false })
        .limit(40);
      profilePosts = posts as Post[];
    }
  }
  return (
    <ProductRouter
      path={path}
      initial={initial}
      post={post}
      person={person}
      profilePosts={profilePosts}
    />
  );
}
