// Real Supabase + real application HTTP routes. Never imports preview fixtures.
// No traces, storageState files, passwords, tokens, or email contents are recorded.
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

nextEnv.loadEnvConfig(process.cwd(), true);
const reportPath = "docs/review-2026-10-20/live-verification.json";
const report = {
  checked_at: new Date().toISOString(),
  mode: "real Supabase and application endpoints",
  status: "blocked",
  checks: [],
  blockers: [],
  email_delivery_verified: false,
  third_account_realtime_verified: false,
  confirmation_method:
    process.env.SRITEDU_TEST_CONFIRMATION === "admin"
      ? "explicit administrator confirmation; SMTP not verified"
      : "operator clicks the real verification emails",
};
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "SRITEDU_TEST_EMAIL_A",
  "SRITEDU_TEST_EMAIL_B",
];
const missing = required.filter((name) => !process.env[name]);
if (!key)
  missing.push(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
async function save() {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2));
}
if (missing.length) {
  report.blockers = missing.map((name) => `${name} is not configured`);
  await save();
  console.log(
    "BLOCKED: " +
      missing.join(", ") +
      ". Configure these privately; never paste keys into chat.",
  );
  process.exit(2);
}

const appOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL).origin;
const base = process.env.SRITEDU_TEST_BASE_URL || appOrigin;
if (new URL(base).pathname !== "/")
  throw new Error(
    "Use the application origin, without /preview or another path.",
  );
const backend = process.env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(backend, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const run = Date.now().toString(36);
const accounts = ["A", "B", "C"]
  .filter((label) => process.env[`SRITEDU_TEST_EMAIL_${label}`])
  .map((label) => ({
    label,
    email: process.env[`SRITEDU_TEST_EMAIL_${label}`],
    password: randomBytes(30).toString("base64url") + "!9a",
    username: `qa_${label.toLowerCase()}_${run}`,
    created: false,
    sdk: createClient(backend, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  }));
let browser;
let currentStage = "preflight";
const channels = [];
const storagePaths = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function assert(value, message) {
  if (!value) throw new Error(message);
}
async function stage(name, fn) {
  currentStage = name;
  await fn();
  report.checks.push({ name, result: "passed" });
  console.log("PASS " + name);
}
async function userForEmail(email) {
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    assert(
      !error,
      "Unable to inspect test-account availability with the server credential.",
    );
    const user = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (user || data.users.length < 1000) return user;
  }
}
async function post(account, path, data) {
  const response = await account.context.request.post(path, {
    headers: { Origin: appOrigin },
    data,
  });
  assert(
    response.ok(),
    `Application request failed (${response.status()}); check server configuration for this stage.`,
  );
  return response.json();
}
const act = (account, kind, payload) =>
  post(account, "/api/action", { kind, payload });
async function snapshot(account) {
  const response = await account.context.request.get("/api/data");
  assert(
    response.ok(),
    `Account ${account.label} snapshot failed (${response.status()}).`,
  );
  return response.json();
}
async function upload(account, target, id, bytes, name, mime) {
  const response = await account.context.request.post("/api/upload", {
    headers: { Origin: appOrigin },
    multipart: {
      type: target,
      id,
      caption: "Disposable sritedu QA fixture",
      file: { name, mimeType: mime, buffer: bytes },
    },
    timeout: 120000,
  });
  assert(
    response.ok(),
    `Validated ${mime} upload failed (${response.status()}). Check server credentials, bucket setup and FFmpeg.`,
  );
  const media = await response.json();
  storagePaths.push(
    `media/${media.id}${mime.startsWith("image/") ? ".webp" : ".mp4"}`,
  );
  if (mime.startsWith("video/"))
    storagePaths.push(`media/${media.id}-poster.webp`);
  return media.id;
}
async function subscription(account, conversationId, receive) {
  const channel = account.sdk.channel(`sritedu-qa-${account.label}-${run}`).on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `conversation_id=eq.${conversationId}`,
    },
    receive,
  );
  channels.push({ sdk: account.sdk, channel });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Realtime subscription did not become ready.")),
      20000,
    );
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout);
        resolve();
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        clearTimeout(timeout);
        reject(new Error("Realtime subscription failed."));
      }
    });
  });
}
async function until(fn, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await sleep(500);
  }
  throw new Error(
    "Expected live state did not arrive within the bounded wait.",
  );
}

try {
  await stage("configuration, migrations and private bucket", async () => {
    const { data, error } = await admin.from("communities").select("slug");
    assert(
      !error && data.length === 10,
      "Apply the five migrations to the intended project before live verification.",
    );
    const bucket = await admin.storage.getBucket("private-media");
    assert(
      !bucket.error && bucket.data.public === false,
      "The private-media bucket is missing or public.",
    );
    assert(
      Number(bucket.data.file_size_limit) === 52428800,
      "The private bucket must retain the documented 50 MB cap.",
    );
    for (const account of accounts) {
      assert(
        /sritedu[-+._]qa/i.test(account.email.split("@")[0]),
        "Use disposable addresses with sritedu-qa in the local part, on an inbox/domain you control.",
      );
      assert(
        !(await userForEmail(account.email)),
        "A requested test address already exists. Choose an unused QA address; existing accounts are never overwritten.",
      );
    }
  });
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const image = await sharp({
    create: { width: 240, height: 180, channels: 3, background: "#ff4f9a" },
  })
    .png()
    .toBuffer();
  for (const account of accounts) {
    account.context = await browser.newContext({ baseURL: base });
    await stage(
      `account ${account.label}: real signup and verification`,
      async () => {
        await post(account, "/api/auth", {
          kind: "sign-up",
          email: account.email,
          password: account.password,
          adult: true,
        });
        const user = await userForEmail(account.email);
        assert(user, "Signup did not create the disposable Supabase user.");
        account.id = user.id;
        account.created = true;
        if (process.env.SRITEDU_TEST_CONFIRMATION === "admin") {
          const { error } = await admin.auth.admin.updateUserById(account.id, {
            email_confirm: true,
          });
          assert(
            !error,
            "Explicit test-only administrator confirmation failed.",
          );
        } else {
          console.log(
            `WAIT Account ${account.label}: confirm its real email in your own inbox. No link or key should be shared in chat.`,
          );
          const deadline =
            Date.now() +
            Number(process.env.SRITEDU_TEST_EMAIL_WAIT_SECONDS || 600) * 1000;
          let confirmed = false;
          while (Date.now() < deadline) {
            const { data, error } = await admin.auth.admin.getUserById(
              account.id,
            );
            assert(!error, "Unable to inspect confirmation state.");
            if (data.user.email_confirmed_at) {
              confirmed = true;
              break;
            }
            await sleep(5000);
          }
          if (!confirmed) {
            report.blockers.push(
              `Account ${account.label} is awaiting a real email confirmation.`,
            );
            throw new Error("Email confirmation is still pending.");
          }
        }
        await post(account, "/api/auth", {
          kind: "sign-in",
          email: account.email,
          password: account.password,
        });
        const { error } = await account.sdk.auth.signInWithPassword({
          email: account.email,
          password: account.password,
        });
        assert(
          !error,
          "The independently authenticated realtime client could not sign in.",
        );
        await act(account, "onboard", {
          display_name: `sritedu QA ${account.label}`,
          username: account.username,
          bio: "Disposable live verification account",
          avatar: "bloom",
          language: "English",
          intent: "I want someone to listen",
          topics: ["moving-forward"],
          discovery: account.label !== "C",
          show_topics: false,
          profile_visible: true,
          accept_requests: true,
          accepted: true,
        });
        assert(
          (await snapshot(account)).me.id === account.id,
          "The live session does not belong to the expected identity.",
        );
      },
    );
  }
  report.email_delivery_verified =
    process.env.SRITEDU_TEST_CONFIRMATION !== "admin";
  const [a, b, c] = accounts;
  let conversationId;
  await stage(
    "profile photo upload through the real validation/storage path",
    async () => {
      const avatarId = await upload(
        a,
        "avatar",
        a.id,
        image,
        "qa-avatar.png",
        "image/png",
      );
      assert(
        (await snapshot(a)).me.avatar === `media:${avatarId}`,
        "The profile photo was not persisted.",
      );
    },
  );
  await stage(
    "text-only connection request and mutual acceptance",
    async () => {
      await act(a, "request", {
        target_id: b.id,
        note: "Disposable QA connection request",
      });
      const pending = (await snapshot(b)).connections.find(
        (x) => x.requester_id === a.id && x.status === "pending",
      );
      assert(
        pending,
        "The recipient did not receive the real pending request.",
      );
      assert(
        !(await snapshot(a)).conversations.length,
        "A conversation opened before acceptance.",
      );
      const rejected = await a.context.request.post("/api/upload", {
        headers: { Origin: appOrigin },
        multipart: {
          type: "message",
          id: randomUUID(),
          file: { name: "qa.png", mimeType: "image/png", buffer: image },
        },
      });
      assert(
        !rejected.ok(),
        "An attachment was accepted without an authorized message/conversation.",
      );
      await act(b, "connection", { id: pending.id, status: "accepted" });
      conversationId = (await snapshot(a)).conversations.find(
        (x) => x.other.id === b.id,
      )?.id;
      assert(
        conversationId,
        "Mutual acceptance did not create a conversation.",
      );
    },
  );
  let received = false;
  let thirdReceived = false;
  await subscription(b, conversationId, (event) => {
    if (event.new.body === `QA realtime ${run}`) received = true;
  });
  if (c)
    await subscription(c, conversationId, () => {
      thirdReceived = true;
    });
  const text = `QA realtime ${run}`;
  await stage(
    "persistent text in both directions and authorized realtime delivery",
    async () => {
      await act(a, "message", { conversation_id: conversationId, body: text });
      await until(() => received);
      await act(b, "message", {
        conversation_id: conversationId,
        body: `QA reply ${run}`,
      });
      const messages =
        (await snapshot(a)).conversations.find((x) => x.id === conversationId)
          ?.messages || [];
      assert(
        messages.some((x) => x.body === text) &&
          messages.some((x) => x.body === `QA reply ${run}`),
        "Both persisted text messages were not readable by the participants.",
      );
    },
  );
  let photoId, videoId;
  await stage(
    "photo message, authenticated bytes and private/no-store response",
    async () => {
      const message = await act(a, "message", {
        conversation_id: conversationId,
        body: "QA photo attachment",
      });
      photoId = await upload(
        a,
        "message",
        message.id,
        image,
        "qa-photo.png",
        "image/png",
      );
      const response = await b.context.request.get(`/api/media/${photoId}`);
      assert(
        response.ok() &&
          response.headers()["content-type"]?.startsWith("image/webp"),
        "The recipient could not retrieve the re-encoded image.",
      );
      assert(
        response.headers()["cache-control"]?.includes("no-store"),
        "Sensitive image bytes were cacheable.",
      );
    },
  );
  await stage(
    "video message, private poster and authorized byte-range playback",
    async () => {
      const dir = await mkdtemp(join(tmpdir(), "sritedu-live-"));
      try {
        const file = join(dir, "qa.mp4");
        execFileSync(
          "ffmpeg",
          [
            "-nostdin",
            "-v",
            "error",
            "-f",
            "lavfi",
            "-i",
            "color=c=0xff4f9a:s=160x120:d=0.5",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            file,
          ],
          { timeout: 15000, stdio: "ignore" },
        );
        const message = await act(a, "message", {
          conversation_id: conversationId,
          body: "QA video attachment",
        });
        videoId = await upload(
          a,
          "message",
          message.id,
          await readFile(file),
          "qa-video.mp4",
          "video/mp4",
        );
        const video = await b.context.request.get(`/api/media/${videoId}`, {
          headers: { Range: "bytes=0-63" },
        });
        assert(
          video.status() === 206 && (await video.body()).length === 64,
          "Authenticated video byte ranges failed.",
        );
        const poster = await b.context.request.get(
          `/api/media/${videoId}?poster=1`,
        );
        assert(
          poster.ok() &&
            poster.headers()["content-type"]?.startsWith("image/webp"),
          "The private video poster was unavailable.",
        );
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    },
  );
  await stage(
    "fresh browser context and page refresh preserve the real session and messages",
    async () => {
      const fresh = await browser.newContext({
        baseURL: base,
        storageState: await a.context.storageState(),
      });
      try {
        const page = await fresh.newPage();
        await page.goto(`/messages/${conversationId}`);
        await page
          .getByText(text, { exact: true })
          .waitFor({ state: "visible", timeout: 15000 });
        await page.reload();
        await page
          .getByText(text, { exact: true })
          .waitFor({ state: "visible", timeout: 15000 });
        const response = await fresh.request.get("/api/data");
        const data = await response.json();
        const messages =
          data.conversations.find((x) => x.id === conversationId)?.messages ||
          [];
        assert(
          data.me.id === a.id &&
            messages.some((m) => m.media.some((x) => x.id === photoId)) &&
            messages.some((m) => m.media.some((x) => x.id === videoId)),
          "Media or session state did not persist in a fresh browser context.",
        );
      } finally {
        await fresh.close();
      }
    },
  );
  if (c) {
    await stage(
      "third-account conversation, media, poster and realtime denial",
      async () => {
        assert(
          !(await snapshot(c)).conversations.some(
            (x) => x.id === conversationId,
          ),
          "An unrelated user saw the conversation.",
        );
        for (const path of [
          `/api/media/${photoId}`,
          `/api/media/${videoId}`,
          `/api/media/${videoId}?poster=1`,
        ])
          assert(
            (await c.context.request.get(path)).status() === 404,
            "An unrelated user read private media.",
          );
        await sleep(2500);
        assert(
          !thirdReceived,
          "An unrelated realtime subscriber received a private message event.",
        );
        report.third_account_realtime_verified = true;
      },
    );
  } else {
    report.blockers.push(
      "Optional third-account realtime/media probes were not run: SRITEDU_TEST_EMAIL_C is unset.",
    );
  }
  await stage(
    "blocking revokes both participants’ conversation and media access and prevents new writes",
    async () => {
      await act(b, "block", { target_id: a.id });
      for (const actor of [a, b]) {
        assert(
          !(await snapshot(actor)).conversations.some(
            (x) => x.id === conversationId,
          ),
          "A blocked conversation remained available.",
        );
        assert(
          (
            await actor.context.request.get(`/api/media/${photoId}`)
          ).status() === 404,
          "Blocked photo access was not revoked.",
        );
        assert(
          (
            await actor.context.request.get(`/api/media/${videoId}?poster=1`)
          ).status() === 404,
          "Blocked poster access was not revoked.",
        );
        const response = await actor.context.request.post("/api/action", {
          headers: { Origin: appOrigin },
          data: {
            kind: "message",
            payload: {
              conversation_id: conversationId,
              body: "Must be rejected after block",
            },
          },
        });
        assert(
          !response.ok(),
          "A blocked identity could still write messages.",
        );
      }
      const request = await a.context.request.post("/api/action", {
        headers: { Origin: appOrigin },
        data: {
          kind: "request",
          payload: { target_id: b.id, note: "Must be rejected after block" },
        },
      });
      assert(!request.ok(), "A blocked identity could send another request.");
    },
  );
  report.status = "passed";
} catch {
  report.status = report.blockers.length ? "blocked" : "failed";
  report.failed_stage = currentStage;
  // Error bodies may contain account identifiers or provider details; do not serialize them.
  report.failure =
    "This stage did not pass. Check its documented setup requirements and server/provider status privately.";
  console.log(`${report.status.toUpperCase()}: ${currentStage}`);
  process.exitCode = report.status === "blocked" ? 2 : 1;
} finally {
  for (const item of channels)
    await item.sdk.removeChannel(item.channel).catch(() => {});
  for (const account of accounts)
    await account.sdk.auth.signOut().catch(() => {});
  await browser?.close();
  let removed = 0,
    cleanupFailed = 0;
  for (const account of accounts.filter((a) => a.created)) {
    try {
      const id = account.id || (await userForEmail(account.email))?.id;
      if (id) {
        const { error } = await admin.auth.admin.deleteUser(id);
        if (error) cleanupFailed++;
        else removed++;
      }
    } catch {
      cleanupFailed++;
    }
  }
  if (storagePaths.length) {
    const { error } = await admin.storage
      .from("private-media")
      .remove(storagePaths);
    if (error) cleanupFailed++;
  }
  report.cleanup = {
    disposable_accounts_removed: removed,
    failures: cleanupFailed,
    note: "Only this run’s new QA identities and known QA object paths are removed. No global cleanup job is invoked.",
  };
  await save();
}
console.log(
  `Live verification: ${report.status}. Redacted report: ${reportPath}`,
);
