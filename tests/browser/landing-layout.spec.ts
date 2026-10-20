import { test, expect } from "@playwright/test";

for (const width of [320, 360, 393, 480, 600, 760]) {
  test(`landing text and actions stay inside the phone viewport at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".hero h1")).toBeVisible();

    // A hidden-overflow parent can hide text without increasing scrollWidth.
    // Check the actual rendered text fragments and interactive targets instead.
    const clipped = await page.evaluate(() => {
      const failures: string[] = [];
      for (const selector of [
        ".hero h1",
        ".hero .eyebrow",
        ".hero-description",
        ".hero-footnote",
      ]) {
        const element = document.querySelector(selector)!;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent?.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            if (rect.width && (rect.left < -1 || rect.right > innerWidth + 1))
              failures.push(selector + ": " + node.textContent?.trim());
          }
        }
      }
      for (const element of document.querySelectorAll(
        ".hero-actions a, .marketing-header > .logo, .header-actions > a, .header-actions > button",
      )) {
        const rect = element.getBoundingClientRect();
        if (rect.width && (rect.left < -1 || rect.right > innerWidth + 1))
          failures.push(
            element.textContent?.trim() ||
              element.getAttribute("aria-label") ||
              "control",
          );
      }
      return failures;
    });
    expect(clipped).toEqual([]);

    const toggle = page.locator(".mobile-menu");
    await expect(toggle).toHaveAccessibleName("Open navigation");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toHaveAccessibleName("Close navigation");
    const panel = page.locator(".mobile-menu-panel");
    await expect(panel).toBeVisible();
    const bounds = await panel.boundingBox();
    const heading = await page.locator(".hero h1").boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(heading!.y);
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
  });
}
