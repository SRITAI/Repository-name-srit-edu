// Run from a trusted operator terminal. Keys come only from environment variables.
import { createClient } from "@supabase/supabase-js";
const email = process.argv[2],
  role = process.argv[3] || "admin";
if (!email || !["member", "moderator", "admin"].includes(role))
  throw new Error(
    "Usage: npm run admin -- person@example.com [admin|moderator|member]",
  );
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
)
  throw new Error("Load server-only Supabase environment variables first.");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
let target: string | undefined;
for (let page = 1; !target; page++) {
  const { data, error } = await db.auth.admin.listUsers({
    page,
    perPage: 1000,
  });
  if (error) throw error;
  target = data.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  )?.id;
  if (data.users.length < 1000) break;
}
if (!target)
  throw new Error(
    "Account not found. The person must sign up, confirm their email, and finish onboarding first.",
  );
const { data: profile, error: profileError } = await db
  .from("community_profiles")
  .select("id")
  .eq("id", target)
  .maybeSingle();
if (profileError || !profile)
  throw new Error("Complete onboarding before granting a role.");
const { error } = await db.rpc("set_role", {
  target,
  new_role: role,
  actor: target,
});
if (error) throw error;
console.log(
  `Role ${role} assigned and audited. No password was created or printed.`,
);
