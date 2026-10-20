import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const base = process.env.REVIEW_BASE_URL || "http://localhost:3000";
const directory = process.env.REVIEW_OUTPUT_DIR || "docs/review-2026-10-20";
await mkdir(join(directory, "screenshots"), { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const screens = [
  ["landing", "/"],
  ["home", "/preview/home"],
  ["onboarding", "/preview/onboarding"],
  ["communities", "/preview/communities"],
  ["profile", "/preview/u/alex_here"],
  ["chat", "/preview/messages/00000000-0000-4000-8000-000000000040"],
];
const result = {
  checked_at: new Date().toISOString(),
  base,
  mode: "fictional preview",
  screens: [],
  errors: [],
};
try {
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on("pageerror", (error) =>
      result.errors.push({ device, message: error.message }),
    );
    for (const [name, path] of screens) {
      const response = await page.goto(base + path, {
        waitUntil: "networkidle",
      });
      if (path.startsWith("/preview"))
        await page.waitForFunction(() =>
          Boolean(sessionStorage.getItem("sritedu-fictional-preview-v1")),
        );
      await page
        .locator(name === "chat" ? ".chat-pane" : "h1")
        .waitFor({ state: "visible" });
      const filename = `${name}-${device}.png`;
      await page.screenshot({
        path: join(directory, "screenshots", filename),
        fullPage: true,
      });
      const metrics = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        background: getComputedStyle(document.body).backgroundColor,
        pink: getComputedStyle(document.documentElement)
          .getPropertyValue("--pink")
          .trim(),
        headline: document.querySelector("h1")?.textContent,
      }));
      result.screens.push({
        name,
        path,
        device,
        status: response.status(),
        screenshot: `screenshots/${filename}`,
        noHorizontalOverflow: metrics.scrollWidth <= metrics.width + 1,
        ...metrics,
      });
      if (name === "onboarding") {
        await page
          .getByRole("button", { name: "Continue", exact: true })
          .click();
        await page
          .getByRole("heading", { name: "What brings you here?" })
          .waitFor();
        await page.screenshot({
          path: join(
            directory,
            "screenshots",
            `onboarding-topics-${device}.png`,
          ),
          fullPage: true,
        });
      }
    }
    // The narrower supported phone size is inspected independently of the screenshots.
    if (device === "mobile") {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(base + "/preview/home", { waitUntil: "networkidle" });
      result.home360 = await page.evaluate(() => ({
        noHorizontalOverflow:
          document.documentElement.scrollWidth <= innerWidth + 1,
        width: innerWidth,
      }));
    }
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(
  join(directory, "browser-review.json"),
  JSON.stringify(result, null, 2),
);
console.log(
  JSON.stringify({
    screenshots: result.screens.length + 2,
    inspected: result.screens.length,
    noHorizontalOverflow: result.screens.every((s) => s.noHorizontalOverflow),
    pageErrors: result.errors.length,
    home360: result.home360,
  }),
);
if (result.errors.length || result.screens.some((s) => !s.noHorizontalOverflow))
  process.exitCode = 1;
