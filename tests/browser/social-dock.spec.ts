import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1440]) {
  test(`social dock fits and keeps chat controls reachable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/preview/home");
    await expect(page.locator('[data-preview-ready="true"]')).toBeVisible();
    const dock = page.getByRole("navigation", { name: "Social navigation" });
    await expect(dock).toBeVisible();
    await expect(dock.getByRole("link", { name: "Feed", exact: true })).toHaveAttribute("aria-current", "page");
    await page.screenshot({ path: testInfo.outputPath("feed.png"), fullPage: false });
    const bounds = await dock.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    for (const control of await dock.locator("a,button").all()) {
      const box = await control.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      await expect(control).toBeInViewport();
    }
    await dock.getByRole("link", { name: /^Add friends/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Add friends.");
    await expect(dock.getByRole("link", { name: /^Add friends/ })).toHaveAttribute("aria-current", "page");
    await dock.getByRole("link", { name: "Categories", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Search communities" })).toBeVisible();
    await dock.getByRole("link", { name: "Profile", exact: true }).click();
    await expect(page).toHaveURL(/u\/alex_here$/);
    await expect(dock.getByRole("link", { name: "Profile", exact: true })).toHaveAttribute("aria-current", "page");
    await dock.getByRole("link", { name: /^Messages/ }).click();
    await page.locator(".chat-list-item").filter({ hasText: "Maya" }).click();
    const message = page.getByRole("textbox", { name: "Message", exact: true });
    await expect(message).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("chat.png"), fullPage: false });
    const composerBox = await message.boundingBox();
    const chatDockBox = await dock.boundingBox();
    expect(composerBox!.y + composerBox!.height).toBeLessThan(chatDockBox!.y);
    await message.fill("A hello from the glass dock test.");
    await page.getByRole("button", { name: "Send message", exact: true }).click();
    await expect(page.getByText("A hello from the glass dock test.", { exact: true })).toBeVisible();
    await dock.getByRole("link", { name: "Feed", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your feed.");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const bookmark = page.getByRole("button", { name: "Bookmark story", exact: true }).last();
    await expect(bookmark).toBeInViewport();
    const bookmarkBox = await bookmark.boundingBox();
    expect(bookmarkBox!.y + bookmarkBox!.height).toBeLessThan((await dock.boundingBox())!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test("bottom share opens a mobile sheet and publishes a persistent preview post", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/preview/home");
  await expect(page.locator('[data-preview-ready="true"]')).toBeVisible();
  await page.getByRole("navigation", { name: "Social navigation" })
    .getByRole("button", { name: "Share post", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Create a post", exact: true });
  await expect(dialog).toBeVisible();
  await expect.poll(async () => {
    const box = await dialog.boundingBox();
    return Math.abs(box!.y + box!.height - 844);
  }).toBeLessThan(2);
  await dialog.getByLabel("Your story").fill("A fictional new chapter shared from the bottom panel.");
  await dialog.getByLabel("Community", { exact: true }).selectOption("moving-forward");
  await dialog.getByRole("button", { name: "Share your story", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".post-card").filter({ hasText: "A fictional new chapter shared from the bottom panel." })).toBeVisible();
  await page.reload();
  await expect(page.locator(".post-card").filter({ hasText: "A fictional new chapter shared from the bottom panel." })).toBeVisible();
});

test("add friends filters shared categories and sends a mutual-consent request", async ({ page }) => {
  await page.goto("/preview/home");
  await expect(page.locator('[data-preview-ready="true"]')).toBeVisible();
  await page.getByRole("navigation", { name: "Social navigation" })
    .getByRole("link", { name: /^Add friends/ }).click();
  await page.getByLabel("Shared topic", { exact: true }).selectOption("founder-pressure");
  const person = page.locator(".person-card").filter({ hasText: "Arjun" });
  await expect(page.locator(".person-card")).toHaveCount(1);
  await person.getByRole("button", { name: "Add friend", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Your message", { exact: true }).fill("Hi Arjun, I would welcome a listening ear.");
  await dialog.getByRole("button", { name: "Send request", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(person).toContainText("Request pending");
});

test("public shortcuts use real routes and reduced motion removes dock animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const dock = page.getByRole("navigation", { name: "Community shortcuts" });
  await expect(dock.getByRole("link", { name: "Share post", exact: true })).toHaveAttribute("href", "/sign-up");
  await expect(dock.getByRole("link", { name: "Messages", exact: true })).toHaveAttribute("href", "/messages");
  await expect(dock.getByRole("link", { name: "Profile", exact: true })).toHaveAttribute("href", "/sign-in");
  expect(await dock.evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
  await dock.getByRole("link", { name: "Feed", exact: true }).click();
  await expect(page).toHaveURL(/sign-in/);
});
