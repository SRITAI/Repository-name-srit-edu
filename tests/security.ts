import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
const dir = await mkdtemp(join(tmpdir(), "sritedu-security-"));
let db = new PGlite(dir);
let checks = 0;
const legacy = process.env.SECURITY_EMPTY_PROJECT !== "1";
async function check(name: string, fn: () => Promise<void>) {
  await fn();
  checks++;
  console.log("PASS", name);
}
const a = "10000000-0000-4000-8000-000000000001",
  b = "10000000-0000-4000-8000-000000000002",
  c = "10000000-0000-4000-8000-000000000003";
async function as(uid: string, fn: () => Promise<void>) {
  await db.exec("set role authenticated");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [uid]);
  try {
    await fn();
  } finally {
    await db.exec("reset role");
    await db.exec("select set_config('request.jwt.claim.sub','',false)");
  }
}
async function act(kind: string, p: Record<string, unknown>) {
  return (
    await db.query<{ result: { id: string } }>(
      "select public.act($1,$2::jsonb) as result",
      [kind, JSON.stringify(p)],
    )
  ).rows[0].result;
}
async function count(table: string, where = "", args: unknown[] = []) {
  return (
    await db.query<{ n: number }>(
      `select count(*)::int as n from public.${table} ${where}`,
      args,
    )
  ).rows[0].n;
}
async function denied(fn: () => Promise<unknown>) {
  let rejected = false;
  try {
    await fn();
  } catch {
    rejected = true;
  }
  assert.ok(rejected, "Expected authorization/constraint rejection");
}
try {
  await db.exec(
    "create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;create table auth.users(id uuid primary key);create function auth.uid()returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,service_role;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create publication supabase_realtime;",
  );
  if (legacy)
    await db.exec(`
      create table public.profiles(id uuid primary key references auth.users on delete cascade, full_name text not null default '', email text, role text not null default 'student');
      create table public.courses(id int primary key, title text);
      create table public.orders(id int primary key, user_id uuid references public.profiles on delete cascade);
      create table public.payments(id int primary key, order_id int references public.orders on delete cascade);
      alter table public.profiles enable row level security;
      alter table public.courses enable row level security;
      alter table public.orders enable row level security;
      alter table public.payments enable row level security;
      create policy legacy_profile_owner on public.profiles for select to authenticated using(id=auth.uid());
      grant select on public.profiles to authenticated;
      create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.profiles(id) values(new.id);return new;end$$;
      create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
      create function public.legacy_access_probe() returns boolean language sql as $$select true$$;
      grant execute on function public.legacy_access_probe() to authenticated;
      insert into auth.users values('10000000-0000-4000-8000-000000000099');
      insert into public.courses values(1,'Legacy fixture');
      insert into public.orders values(1,'10000000-0000-4000-8000-000000000099');
      insert into public.payments values(1,1);
    `);
  const files = (await readdir("supabase/migrations"))
    .filter((n) => n.endsWith(".sql"))
    .sort();
  for (const file of files)
    await db.exec(await readFile("supabase/migrations/" + file, "utf8"));
  await check("all migrations apply in lexical order", async () =>
    assert.ok(files.length === 5),
  );
  if (legacy)
    await check(
      "legacy education rows, trigger and privileges survive installation",
      async () => {
        assert.equal(await count("profiles"), 1);
        assert.equal(await count("courses"), 1);
        assert.equal(await count("orders"), 1);
        assert.equal(await count("payments"), 1);
        const result = await db.query<{
          old_grant: boolean;
          old_table_grant: boolean;
        }>(
          "select has_function_privilege('authenticated','public.legacy_access_probe()','execute') as old_grant, has_table_privilege('service_role','public.profiles','select') as old_table_grant",
        );
        assert.equal(result.rows[0].old_grant, true);
        assert.equal(result.rows[0].old_table_grant, false);
      },
    );
  await db.query("insert into auth.users values($1),($2),($3)", [a, b, c]);
  if (legacy)
    await check(
      "shared Auth signup still creates only the legacy profile until consent",
      async () => {
        assert.equal(await count("profiles"), 4);
        assert.equal(await count("community_profiles"), 0);
        await db.query("insert into public.orders values(2,$1)", [b]);
      },
    );
  const profile = (name: string, topics = ["moving-forward"]) => ({
    display_name: name,
    username: name.toLowerCase(),
    bio: "A test account",
    avatar: "orbit",
    language: "English",
    intent: "I want someone to listen",
    topics,
    discovery: true,
    show_topics: false,
    profile_visible: true,
    accept_requests: true,
    accepted: true,
  });
  for (const [id, name, topics] of [
    [a, "alice", ["moving-forward"]],
    [b, "bobby", ["moving-forward"]],
    [c, "carol", ["career-challenges"]],
  ] as const)
    await as(id, async () => {
      await db.query("select public.onboard($1)", [
        JSON.stringify(profile(name, [...topics])),
      ]);
    });
  await check(
    "three users onboard without publishing membership lists",
    async () => {
      await as(c, async () => {
        assert.equal(await count("memberships"), 1);
        assert.equal(await count("private_profile_settings"), 1);
        assert.equal(await count("discovery_preferences"), 1);
      });
    },
  );
  await check(
    "direct writes and private roles cannot be escalated",
    async () => {
      await as(a, async () => {
        await denied(() =>
          db.exec("update public.private_profile_settings set suspended=false"),
        );
        await denied(() =>
          db.exec(`insert into private.roles values('${a}','admin')`),
        );
        await denied(() =>
          db.query("select public.set_role($1,$2,$3)", [a, "admin", a]),
        );
        await denied(() =>
          act("moderate", { id: a, action: "resolve", note: "Privilege test" }),
        );
        assert.equal(
          (await db.query<{ role: string }>("select public.my_role() as role"))
            .rows[0].role,
          "member",
        );
      });
    },
  );
  let community = "",
    draft = "",
    connectionsOnly = "",
    conversation = "",
    message = "",
    image = "",
    posterTicket = "";
  await as(a, async () => {
    community = (
      await act("post", {
        body: "Community story",
        community_slug: "moving-forward",
        audience: "community",
      })
    ).id;
    draft = (
      await act("post", {
        body: "Owner-only draft",
        community_slug: "moving-forward",
        audience: "draft",
      })
    ).id;
    connectionsOnly = (
      await act("post", {
        body: "Connection-only story",
        community_slug: "moving-forward",
        audience: "connections",
      })
    ).id;
  });
  await check(
    "post audiences exclude non-members and third accounts",
    async () => {
      await as(b, async () => {
        assert.equal(await count("posts", "where id=$1", [community]), 1);
        assert.equal(await count("posts", "where id=$1", [draft]), 0);
        assert.equal(await count("posts", "where id=$1", [connectionsOnly]), 0);
      });
      await as(c, async () => assert.equal(await count("posts"), 0));
    },
  );
  await check(
    "reactions, comments, one-level replies, and bookmarks persist",
    async () => {
      await as(b, async () => {
        await act("reaction", { id: community, reaction: "I hear you" });
        await act("comment", { post_id: community, body: "I hear you." });
        const parent = (
          await db.query<{ id: string }>(
            "select id from public.comments where post_id=$1",
            [community],
          )
        ).rows[0].id;
        await act("comment", {
          post_id: community,
          body: "A reply",
          parent_id: parent,
        });
        const reply = (
          await db.query<{ id: string }>(
            "select id from public.comments where parent_id=$1",
            [parent],
          )
        ).rows[0].id;
        await denied(() =>
          act("comment", {
            post_id: community,
            body: "Too deep",
            parent_id: reply,
          }),
        );
        await act("bookmark", { id: community });
        assert.equal(await count("bookmarks"), 1);
        assert.equal(await count("comments"), 2);
      });
      await as(c, async () => {
        assert.equal(await count("comments"), 0);
        assert.equal(await count("reactions"), 0);
        assert.equal(await count("bookmarks"), 0);
      });
    },
  );
  await check("private topics never escape through discovery", async () => {
    await as(a, async () => {
      const r = (
        await db.query<{ people: { topics: string[]; id: string }[] }>(
          "select public.discover_people() as people",
        )
      ).rows[0].people;
      assert.ok(r.length > 0);
      assert.ok(r.every((p) => p.topics.length === 0));
    });
  });
  await check(
    "chat and attachments cannot precede mutual acceptance",
    async () => {
      await as(a, async () => {
        await denied(() =>
          act("message", { conversation_id: b, body: "Not accepted" }),
        );
        await denied(() =>
          db.query("select public.reserve_upload($1,$2,$3)", [
            "message",
            b,
            "image",
          ]),
        );
        await act("request", { target_id: b, note: "A short hello." });
      });
      await as(c, async () => {
        assert.equal(await count("connections"), 0);
        assert.equal(await count("messages"), 0);
      });
    },
  );
  await as(b, async () => {
    const request = (
      await db.query<{ id: string }>(
        "select id from public.connections where requester_id=$1",
        [a],
      )
    ).rows[0].id;
    await act("connection", { id: request, status: "accepted" });
    conversation = (
      await db.query<{ id: string }>("select id from public.conversations")
    ).rows[0].id;
  });
  await check(
    "accepted users exchange persistent text; third user sees no conversation",
    async () => {
      await as(a, async () => {
        message = (
          await act("message", {
            conversation_id: conversation,
            body: "A real database message.",
          })
        ).id;
        assert.equal(await count("posts", "where id=$1", [connectionsOnly]), 1);
      });
      await as(b, async () => assert.equal(await count("messages"), 1));
      await as(c, async () => {
        assert.equal(await count("conversations"), 0);
        assert.equal(await count("conversation_members"), 0);
        assert.equal(await count("messages"), 0);
        await denied(() =>
          act("message", {
            conversation_id: conversation,
            body: "Unauthorized",
          }),
        );
      });
    },
  );
  await check("database messages survive close/reopen", async () => {
    await db.close();
    db = new PGlite(dir);
    await as(b, async () =>
      assert.equal(await count("messages", "where id=$1", [message]), 1),
    );
  });
  await check(
    "uploads remain inaccessible until finalized and media rechecks audience",
    async () => {
      await as(a, async () => {
        const ticket = (
          await db.query<{ ticket: { id: string; path: string } }>(
            "select public.reserve_upload($1,$2,$3) as ticket",
            ["message", message, "image"],
          )
        ).rows[0].ticket;
        image = ticket.id;
        assert.equal(
          (
            await db.query<{ path: string | null }>(
              "select public.media_access($1)as path",
              [image],
            )
          ).rows[0].path,
          null,
        );
      });
      await db.query("select public.finalize_upload($1,$2,$3,false)", [
        image,
        a,
        "A private picture",
      ]);
      await as(b, async () =>
        assert.ok(
          (
            await db.query<{ path: string }>(
              "select public.media_access($1)as path",
              [image],
            )
          ).rows[0].path,
        ),
      );
      await as(c, async () => {
        assert.equal(
          (
            await db.query<{ path: string | null }>(
              "select public.media_access($1)as path",
              [image],
            )
          ).rows[0].path,
          null,
        );
        await denied(() =>
          db.query("select public.finalize_upload($1,$2,$3,false)", [
            image,
            c,
            "Hijack",
          ]),
        );
      });
    },
  );
  await check(
    "optional receipts stay private until explicitly enabled",
    async () => {
      await as(b, async () => {
        await act("conversation", { id: conversation, read: true });
      });
      await as(a, async () => {
        const receipts = (
          await db.query<{ r: { user_id: string }[] }>(
            "select public.conversation_receipts() as r",
          )
        ).rows[0].r;
        assert.ok(receipts.every((r) => r.user_id === a));
      });
    },
  );
  let report = "";
  await as(b, async () => {
    report = (
      await act("report", {
        target_type: "message",
        target_id: message,
        reason: "Human review needed for this message.",
      })
    ).id;
  });
  await check(
    "report evidence is narrowly scoped and inaccessible through direct reads",
    async () => {
      await as(b, async () => {
        await denied(() => db.exec("select evidence from public.reports"));
        await denied(() =>
          db.query("select public.review_evidence($1)", [report]),
        );
      });
      await db.query("insert into private.roles values($1,$2)", [
        c,
        "moderator",
      ]);
      await as(c, async () => {
        assert.equal(await count("messages"), 0);
        const evidence = (
          await db.query<{ e: { report: { evidence: { body: string } } } }>(
            "select public.review_evidence($1) as e",
            [report],
          )
        ).rows[0].e;
        assert.equal(evidence.report.evidence.body, "A real database message.");
        assert.ok(
          (
            await db.query<{ p: string }>(
              "select public.evidence_media_access($1,$2)as p",
              [report, image],
            )
          ).rows[0].p,
        );
        assert.ok((await count("moderation_actions")) >= 2);
      });
    },
  );
  await check(
    "blocks revoke both directions, storage, writes, and existing conversations",
    async () => {
      await as(b, async () => {
        await act("block", { target_id: a });
        assert.equal(await count("messages"), 0);
        assert.equal(await count("posts", "where id=$1", [community]), 0);
        assert.equal(
          (
            await db.query<{ path: string | null }>(
              "select public.media_access($1)as path",
              [image],
            )
          ).rows[0].path,
          null,
        );
      });
      await as(a, async () => {
        assert.equal(await count("conversations"), 0);
        assert.equal(await count("messages"), 0);
        await denied(() =>
          act("message", {
            conversation_id: conversation,
            body: "After block",
          }),
        );
        await denied(() =>
          act("request", { target_id: b, note: "After block" }),
        );
        assert.equal(
          (
            await db.query<{ path: string | null }>(
              "select public.media_access($1)as path",
              [image],
            )
          ).rows[0].path,
          null,
        );
      });
    },
  );
  await check(
    "discovery opt-out removes a person from the server response",
    async () => {
      await db.query("delete from public.blocks");
      await db.query(
        "update public.private_profile_settings set discovery=false where user_id=$1",
        [b],
      );
      await as(a, async () => {
        const people = (
          await db.query<{ p: { id: string }[] }>(
            "select public.discover_people()as p",
          )
        ).rows[0].p;
        assert.ok(!people.some((p) => p.id === b));
      });
    },
  );
  await check(
    "suspensions revoke access even with an existing identity",
    async () => {
      await db.query(
        "update public.private_profile_settings set suspended=true where user_id=$1",
        [a],
      );
      await as(a, async () => {
        assert.equal(await count("posts"), 0);
        await denied(() =>
          act("post", {
            body: "Suspended",
            community_slug: "moving-forward",
            audience: "community",
          }),
        );
        await denied(() =>
          db.query("select public.onboard($1)", [
            JSON.stringify(profile("alice")),
          ]),
        );
      });
      await db.query(
        "update public.private_profile_settings set suspended=false where user_id=$1",
        [a],
      );
    },
  );
  await check(
    "suspended owners can appeal, moderators cannot restore accounts, and admins can",
    async () => {
      await db.query(
        "update public.private_profile_settings set suspended=true where user_id=$1",
        [a],
      );
      let appeal = "";
      await as(a, async () => {
        await db.query("select public.submit_appeal($1,$2)", [
          a,
          "Please review my account restriction.",
        ]);
        const result = (
          await db.query<{
            r: { reports: { id: string; target_type: string }[] };
          }>("select public.my_cases() as r")
        ).rows[0].r;
        appeal = result.reports.find((r) => r.target_type === "appeal")!.id;
      });
      await as(c, async () => {
        await denied(() =>
          db.query("select public.restore_account($1,$2)", [
            appeal,
            "Reviewed appeal.",
          ]),
        );
      });
      await db.query("update private.roles set role='admin' where user_id=$1", [
        c,
      ]);
      await as(c, async () => {
        await db.query("select public.restore_account($1,$2)", [
          appeal,
          "Account restored after human review.",
        ]);
      });
      await as(a, async () => {
        assert.ok((await count("posts")) > 0);
      });
    },
  );
  await check(
    "reported-content removal is audited without exposing unrelated messages",
    async () => {
      await as(c, async () => {
        assert.equal(await count("messages"), 0);
        await db.query("select public.remove_reported_item($1,$2)", [
          report,
          "Removed after review of this report.",
        ]);
        assert.ok((await count("moderation_actions")) > 0);
      });
      assert.equal(await count("messages", "where id=$1", [message]), 0);
    },
  );
  await check(
    "member metrics and evidence media access are denied",
    async () => {
      await as(b, async () => {
        await denied(() => db.exec("select public.service_metrics()"));
        await denied(() =>
          db.query("select public.evidence_media_access($1,$2)", [
            report,
            image,
          ]),
        );
      });
      await as(c, async () => {
        const metrics = (
          await db.query<{ m: { accounts: number } }>(
            "select public.service_metrics()as m",
          )
        ).rows[0].m;
        assert.equal(metrics.accounts, 3);
      });
    },
  );
  await check(
    "replacing a profile photo with a non-photo avatar revokes and queues the old object",
    async () => {
      let avatar = "";
      await as(a, async () => {
        avatar = (
          await db.query<{ t: { id: string } }>(
            "select public.reserve_upload($1,$2,$3)as t",
            ["avatar", a, "image"],
          )
        ).rows[0].t.id;
      });
      await db.query("select public.finalize_upload($1,$2,$3,false)", [
        avatar,
        a,
        "Profile photo",
      ]);
      await as(b, async () => {
        assert.ok(
          (
            await db.query<{ p: string }>(
              "select public.media_access($1)as p",
              [avatar],
            )
          ).rows[0].p,
        );
      });
      await as(a, async () => {
        await db.query("select public.onboard($1)", [
          JSON.stringify(profile("alice")),
        ]);
      });
      await as(b, async () => {
        assert.equal(
          (
            await db.query<{ p: string | null }>(
              "select public.media_access($1)as p",
              [avatar],
            )
          ).rows[0].p,
          null,
        );
      });
      assert.ok(
        (
          await db.query<{ path: string }>(
            "select path from private.cleanup_jobs where path like $1",
            ["%" + avatar + ".webp"],
          )
        ).rows.length > 0,
      );
    },
  );
  await check(
    "deletion queues image and video-poster cleanup jobs",
    async () => {
      await as(a, async () => {
        const t = (
          await db.query<{ t: { id: string } }>(
            "select public.reserve_upload($1,$2,$3)as t",
            ["post", draft, "video"],
          )
        ).rows[0].t;
        posterTicket = t.id;
      });
      await db.query("select public.finalize_upload($1,$2,$3,true)", [
        posterTicket,
        a,
        "Video",
      ]);
      await as(a, async () => {
        await act("delete_post", { id: draft });
      });
      const jobs = (
        await db.query<{ path: string }>(
          "select path from private.cleanup_jobs",
        )
      ).rows;
      assert.ok(jobs.some((j) => j.path.endsWith(posterTicket + ".mp4")));
      assert.ok(
        jobs.some((j) => j.path.endsWith(posterTicket + "-poster.webp")),
      );
    },
  );
  await check("database rate limits reject repeated requests", async () => {
    await db.query("delete from private.rate_limits");
    await as(a, async () => {
      for (let i = 0; i < 3; i++)
        await db.query("select private.consume('request',3)").catch(() => {});
      /* consume is intentionally not callable by users */ await denied(() =>
        db.query("select private.consume('request',3)"),
      );
    });
    await db.query(
      "insert into private.rate_limits values($1,'request',date_trunc('minute',now()),3)",
      [a],
    );
    await as(
      a,
      async () =>
        await denied(() =>
          act("request", { target_id: b, note: "Rate-limited request" }),
        ),
    );
  });
  await check("every exposed application table has RLS enabled", async () => {
    const rows = (
      await db.query<{ relname: string; relrowsecurity: boolean }>(
        "select relname,relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and relkind='r'",
      )
    ).rows;
    assert.ok(rows.length >= 23);
    assert.ok(rows.every((r) => r.relrowsecurity));
  });
  await check(
    "community deletion removes only the authenticated community identity",
    async () => {
      await db.exec("set role anon");
      await denied(() => db.exec("select public.delete_community_account()"));
      await db.exec("reset role");
      await as(b, async () => {
        await db.exec("select public.delete_community_account()");
        assert.equal(await count("community_profiles", "where id=$1", [b]), 0);
        assert.equal(await count("posts"), 0);
        await denied(() =>
          act("post", {
            body: "After deletion",
            community_slug: "moving-forward",
            audience: "community",
          }),
        );
      });
      assert.equal(await count("community_profiles", "where id=$1", [a]), 1);
      assert.equal(
        (
          await db.query<{ n: number }>(
            "select count(*)::int as n from auth.users where id=$1",
            [b],
          )
        ).rows[0].n,
        1,
      );
      if (legacy) {
        assert.equal(await count("profiles", "where id=$1", [b]), 1);
        assert.equal(await count("orders", "where user_id=$1", [b]), 1);
        assert.equal(await count("payments"), 1);
      }
    },
  );
  console.log(
    `\n${checks} PostgreSQL integration/security checks passed. Supabase Auth, Storage transport, email and Realtime transport require a live stack.`,
  );
} finally {
  await db.close();
  await rm(dir, { recursive: true, force: true });
}
