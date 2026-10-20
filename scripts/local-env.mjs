// Convert `supabase status -o env` output through stdin; never print credentials.
import { writeFileSync } from "node:fs";
let input = "";
for await (const chunk of process.stdin) input += chunk;
const entries = Object.fromEntries(
  input
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((line) => {
      const at = line.indexOf("=");
      return [line.slice(0, at), line.slice(at + 1).replace(/^"|"$/g, "")];
    }),
);
const publishable = entries.PUBLISHABLE_KEY || entries.ANON_KEY;
const secret = entries.SECRET_KEY || entries.SERVICE_ROLE_KEY;
if (!entries.API_URL || !publishable || !secret)
  throw new Error("Supabase status did not provide the expected keys.");
writeFileSync(
  ".env.local",
  `NEXT_PUBLIC_SUPABASE_URL=${entries.API_URL}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishable}\nSUPABASE_SERVICE_ROLE_KEY=${secret}\nNEXT_PUBLIC_APP_URL=http://localhost:3000\nNEXT_PUBLIC_ENABLE_PREVIEW=true\nGOOGLE_AUTH_ENABLED=false\n`,
  { mode: 0o600, flag: "wx" },
);
console.log(
  "Local Supabase configuration written to ignored .env.local. Values were not printed.",
);
