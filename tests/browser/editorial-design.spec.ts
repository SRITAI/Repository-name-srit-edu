import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`editorial photos load locally and dashboard controls fit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ["/", "/preview/home", "/preview/communities"]) {
      await page.goto(route);
      if (route.startsWith("/preview")) {
        await expect(page.locator('[data-preview-ready="true"]')).toBeVisible();
        await expect(
          page.locator(".dashboard-welcome, .community-toolbar"),
        ).toBeVisible();
      }
      await expect(page.locator(".editorial-photo")).toHaveCount(
        route === "/" ? 13 : route === "/preview/home" ? 4 : 10,
      );
      await expect(page.locator(".editorial-photo").first()).toBeVisible();
      for (const photo of await page.locator(".editorial-photo").all()) {
        await photo.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            photo.evaluate((node) => (node as HTMLImageElement).naturalWidth),
          )
          .toBeGreaterThan(0);
        await expect(photo).toHaveAttribute(
          "src",
          /^\/images\/editorial\/.+\.webp$/,
        );
        await expect(photo).toHaveAttribute("alt", /\S+/);
      }
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() =>
          getComputedStyle(document.documentElement)
            .getPropertyValue("--font-poppins")
            .trim(),
        ),
      ).not.toBe("");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
    }
    await page.goto("/preview/home");
    await page
      .getByRole("button", { name: "Start a new chapter", exact: true })
      .click();
    await expect(
      page.getByRole("dialog").getByLabel("Your story"),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    const finance = page
      .locator(".dashboard-space")
      .filter({ hasText: "Financial stress" });
    await finance.click();
    await expect(page).toHaveURL(/communities\/financial-stress$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Financial Stress",
    );
    await expect(page.locator(".community-cover-photo")).toBeVisible();
  });
}

test("photo community cards retain search and private membership controls", async ({
  page,
}) => {
  await page.goto("/preview/communities");
  await expect(page.locator('[data-preview-ready="true"]')).toBeVisible();
  await page.getByRole("textbox", { name: "Search communities" }).fill("study");
  const card = page.locator(".app-community-card");
  await expect(card).toHaveCount(1);
  await expect(card).toContainText("Study & Exam Pressure");
  const action = card.getByRole("button");
  const joined = (await action.textContent())?.includes("Joined");
  await action.click();
  await expect(action).toContainText(joined ? "Join community" : "Joined");
  await page.reload();
  await expect(page.locator('[data-preview-ready="true"]')).toBeVisible();
  await page.getByRole("textbox", { name: "Search communities" }).fill("study");
  await expect(
    page.locator(".app-community-card").getByRole("button"),
  ).toContainText(joined ? "Join community" : "Joined");
  await expect(page.locator(".app-community-card")).toContainText(
    "Private membership",
  );
});
