import { createClient } from "@supabase/supabase-js";
import { readdir, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
for (const name of await readdir(tmpdir())) {
  if (!name.startsWith("sritedu-media-")) continue;
  const path = join(tmpdir(), name);
  const info = await stat(path).catch(() => null);
  if (info && Date.now() - info.mtimeMs > 3600000)
    await rm(path, { recursive: true, force: true });
}
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
const { data: jobs, error } = await db.rpc("cleanup_batch");
if (error) throw error;
let removed = 0,
  failed = 0;
for (const job of jobs || []) {
  const { error: e } = await db.storage
    .from("private-media")
    .remove([job.path]);
  const { error: updateError } = await db.rpc("cleanup_result", {
    job_id: job.id,
    success: !e,
  });
  if (e || updateError) failed++;
  else removed++;
}
console.log(
  JSON.stringify({
    processed: (jobs || []).length,
    removed,
    failed,
    morePossible: (jobs || []).length === 100,
  }),
);
if (failed) process.exitCode = 1;
