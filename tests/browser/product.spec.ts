import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
async function preview(page: import("@playwright/test").Page, path = "home") {
  await page.goto("/preview/" + path);
  await page.waitForFunction(
    () => !!sessionStorage.getItem("sritedu-fictional-preview-v1"),
  );
}
test("public landing and real routes remain separate from the labelled preview", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /You don’t have to.*alone/,
  );
  await expect(
    page
      .getByRole("link", { name: "Find your community", exact: true })
      .first(),
  ).toHaveAttribute("href", "/sign-up");
  await page
    .getByRole("link", { name: "Explore sritedu", exact: false })
    .first()
    .click();
  await expect(
    page.getByText("Fictional preview", { exact: true }),
  ).toBeVisible();
  await page.goto("/home");
  await expect(page).toHaveURL(/sign-in/);
  await expect(
    page.getByText("Live accounts aren’t connected yet."),
  ).toBeVisible();
});
test("story photos, comments, reactions, bookmarks and journeys survive refresh", async ({
  page,
}) => {
  await preview(page);
  await page
    .getByRole("button", { name: "Share your story", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("textbox", { name: "Your story" })
    .fill("A fictional small win from the browser test.");
  const image = await sharp({
    create: { width: 160, height: 120, channels: 3, background: "#ff4f9a" },
  })
    .png()
    .toBuffer();
  await dialog.locator("input[type=file]").setInputFiles([
    { name: "pink.png", mimeType: "image/png", buffer: image },
    { name: "second.png", mimeType: "image/png", buffer: image },
  ]);
  await dialog
    .getByLabel("Media caption / description")
    .fill("Two pink test images");
  await dialog
    .getByRole("button", { name: "Share your story", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  const post = page
    .locator(".post-card")
    .filter({ hasText: "A fictional small win from the browser test." });
  await expect(post.locator(".image-media")).toHaveCount(2);
  await post.getByRole("button", { name: "I hear you", exact: true }).click();
  await post.getByRole("button", { name: "Leave a little care" }).click();
  await post
    .getByRole("textbox", { name: "Write a supportive comment" })
    .fill("A little kindness from the browser test.");
  await post.getByRole("button", { name: "Send comment" }).click();
  await post.getByRole("button", { name: "Bookmark story" }).click();
  await page.reload();
  const refreshed = page
    .locator(".post-card")
    .filter({ hasText: "A fictional small win from the browser test." });
  await expect(refreshed.locator(".image-media")).toHaveCount(2);
  await expect(
    refreshed.getByRole("button", { name: "Remove bookmark" }),
  ).toBeVisible();
  await refreshed.getByRole("button", { name: "1 comments" }).click();
  await expect(
    refreshed.getByText("A little kindness from the browser test."),
  ).toBeVisible();
  await refreshed.getByLabel("Story actions").click();
  await refreshed.getByRole("button", { name: "Add journey update" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Your story")
    .fill("Chapter two: another small step.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Share your story" })
    .click();
  await expect(
    page.getByText("Chapter two: another small step.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("A chapter in a life journey").first(),
  ).toBeVisible();
});
test("accept a request, exchange text, photos and video, then verify session persistence", async ({
  page,
}) => {
  await preview(page, "discover");
  await page.getByRole("button", { name: /Requests/ }).click();
  await page.getByRole("button", { name: "Accept", exact: true }).click();
  await page.getByRole("button", { name: "Connections", exact: true }).click();
  await page
    .locator(".person-card")
    .filter({ hasText: "Sam" })
    .getByRole("link", { name: "Open conversation" })
    .click();
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Hello from a fictional conversation.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByText("Hello from a fictional conversation.", { exact: true }),
  ).toBeVisible();
  const image = await sharp({
    create: { width: 100, height: 100, channels: 3, background: "#ff8fbe" },
  })
    .png()
    .toBuffer();
  await page
    .locator(".message-composer input[type=file]")
    .setInputFiles({ name: "hello.png", mimeType: "image/png", buffer: image });
  await page.getByLabel("Attachment caption").fill("A little pink hello");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".message-list .image-media")).toHaveCount(1);
  const dir = await mkdtemp(join(tmpdir(), "sritedu-browser-video-"));
  try {
    const file = join(dir, "clip.mp4");
    execFileSync("ffmpeg", [
      "-nostdin",
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "color=c=0xff4f9a:s=160x120:d=0.25",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      file,
    ]);
    await page.locator(".message-composer input[type=file]").setInputFiles({
      name: "clip.mp4",
      mimeType: "video/mp4",
      buffer: await readFile(file),
    });
    await page.getByLabel("Attachment caption").fill("A short fictional video");
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    await expect(page.locator(".message-list video")).toHaveCount(1);
    await expect
      .poll(() =>
        page
          .locator(".message-list video")
          .evaluate((v: HTMLVideoElement) => v.readyState),
      )
      .toBeGreaterThan(0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  await page.reload();
  await expect(
    page.getByText("Hello from a fictional conversation.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".message-list video")).toHaveCount(1);
  await expect
    .poll(() =>
      page
        .locator(".message-list video")
        .evaluate((v: HTMLVideoElement) => v.readyState),
    )
    .toBeGreaterThan(0);
  await expect(page.locator(".message-list .image-media")).toHaveCount(1);
  await page.getByLabel("Conversation controls").click();
  await page
    .getByRole("button", { name: "Mute notifications", exact: true })
    .click();
  await page.getByLabel("Conversation controls").click();
  await expect(
    page.getByRole("button", { name: "Unmute notifications" }),
  ).toBeVisible();
});
test("audience drafts and settings have visible controls; dialogs trap focus and Escape dismisses", async ({
  page,
}) => {
  await preview(page);
  await page
    .getByRole("button", { name: "Share your story", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Your story").fill("An owner-only fictional draft.");
  await dialog.getByLabel("Who can see this?").selectOption("draft");
  await expect(
    dialog.getByText("Only you can see this draft.", { exact: false }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Save private draft" }).click();
  await page.getByRole("button", { name: "Drafts", exact: true }).click();
  await expect(
    page.getByText("An owner-only fictional draft.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Share your story", exact: true })
    .click();
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 15; i++) await page.keyboard.press("Tab");
  expect(await dialog.evaluate((e) => e.contains(document.activeElement))).toBe(
    true,
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.goto("/preview/settings");
  const reduce = page.getByRole("switch", { name: /Reduce motion/ });
  await reduce.check();
  await page.getByRole("button", { name: "Save my preferences" }).click();
  await page.reload();
  await expect(
    page.getByRole("switch", { name: /Reduce motion/ }),
  ).toBeChecked();
  await expect(page.locator("[data-reduce-motion=true]")).toBeVisible();
});
test("upload rejection and report queue are recoverable", async ({ page }) => {
  await preview(page);
  await page
    .getByRole("button", { name: "Share your story", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .locator("input[type=file]")
    .setInputFiles({
      name: "bad.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg/>"),
    });
  await expect(page.getByRole("alert")).toContainText("JPEG");
  await page.keyboard.press("Escape");
  const post = page.locator(".post-card").first();
  await post.getByLabel("Story actions").click();
  await post.getByRole("button", { name: "Report story" }).click();
  await page
    .getByLabel("Reason for this report")
    .fill("Fictional browser report for human review.");
  await page.getByRole("button", { name: "Submit report" }).click();
  await page.goto("/preview/admin");
  await expect(
    page.getByText("Fictional browser report for human review.", {
      exact: true,
    }),
  ).toBeVisible();
});
for (const width of [360, 390, 768, 1440])
  test(`responsive routes have no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/preview/home",
      "/preview/communities",
      "/preview/discover",
      "/preview/messages",
      "/preview/settings",
      "/sign-up",
      "/help",
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        path,
      ).toBe(true);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    expect(
      await page
        .locator(".ribbon-motion")
        .evaluate((e) => getComputedStyle(e).animationDuration),
    ).toBe("1e-05s");
  });
test("important public and private preview screens pass automated accessibility checks", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/preview/home",
    "/sign-up",
    "/help",
    "/preview/settings",
    "/preview/messages",
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        help: v.help,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      path,
    ).toEqual([]);
  }
});

test("profile onboarding edits crop a photo, keep topics private, and follow username changes", async ({
  page,
}) => {
  await preview(page, "u/alex_here");
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Display name", { exact: true })
    .fill("Alex Nextchapter");
  await dialog.getByLabel("Unique username").fill("alex_nextchapter");
  const photo = await sharp({
    create: { width: 300, height: 200, channels: 3, background: "#ff4f9a" },
  })
    .png()
    .toBuffer();
  await dialog
    .locator(".upload-avatar input")
    .setInputFiles({
      name: "portrait.png",
      mimeType: "image/png",
      buffer: photo,
    });
  await expect(dialog.locator(".avatar-picker>.avatar img")).toBeVisible();
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Study & Exam Pressure", exact: false })
    .click();
  await dialog.getByLabel("Language", { exact: true }).selectOption("Hindi");
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    dialog.getByRole("switch", { name: /Share my selected topics/ }),
  ).not.toBeChecked();
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await dialog.getByRole("checkbox").check();
  await dialog
    .getByRole("button", { name: "Save your profile", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/u\/alex_nextchapter/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Alex Nextchapter",
  );
  await page.reload();
  await expect(page.locator(".profile-details>.avatar img")).toBeVisible();
  await expect(
    page.getByText("Your selected topics are private.", { exact: false }),
  ).toBeVisible();
});
