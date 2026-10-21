"use client";
import { createBrowserClient } from "@supabase/ssr";
import { publicSupabaseKey } from "./public-config";
let client: ReturnType<typeof createBrowserClient> | undefined;
export function browserClient() {
  const key = publicSupabaseKey();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) return null;
  return (client ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    key,
  ));
}
