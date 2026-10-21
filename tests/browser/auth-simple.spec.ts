import { expect, test } from "@playwright/test";
import sharp from "sharp";

for (const width of [320, 390, 1440]) {
  test(`email-first account screens fit at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/sign-in",
      "/sign-up",
      "/forgot-password",
      "/reset-password",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("form input").first()).toBeVisible();
      if (width === 390 || width === 1440)
        await page.screenshot({
          path: testInfo.outputPath(path.slice(1) + "-email.png"),
          fullPage: true,
        });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      if (path === "/sign-in" || path === "/sign-up") {
        await expect(page.getByLabel("Password", { exact: true })).toHaveCount(
          0,
        );
        await page
          .getByLabel("Email address", { exact: true })
          .fill("person@example.com");
        await page
          .getByRole("button", { name: "Continue", exact: true })
          .click();
        await expect(
          page.getByLabel("Password", { exact: true }),
        ).toBeFocused();
        const box = await page
          .getByLabel("Password", { exact: true })
          .boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        await expect(
          page.getByRole("button", { name: "Change email address" }),
        ).toBeVisible();
        await page
          .getByRole("button", { name: "Change email address" })
          .click();
        await expect(
          page.getByLabel("Email address", { exact: true }),
        ).toHaveValue("person@example.com");
      }
    }
  });
}

test("mocked login preserves errors, password visibility and retry navigation", async ({
  page,
}) => {
  let attempts = 0;
  await page.route("**/api/auth", async (route) => {
    const payload = route.request().postDataJSON();
    expect(payload.kind).toBe("sign-in");
    expect(payload.email).toBe("person@example.com");
    expect(payload.password).toBe("shortpw");
    attempts++;
    await route.fulfill({
      status: attempts === 1 ? 400 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        attempts === 1
          ? { error: "Email or password is incorrect." }
          : { next: "/preview/home" },
      ),
    });
  });
  await page.goto("/sign-in");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("person@example.com");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  expect(attempts).toBe(0);
  const password = page.getByLabel("Password", { exact: true });
  await password.fill("shortpw");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "text");
  await page
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(
    page.getByRole("form", { name: "Log in", exact: true }).getByRole("alert"),
  ).toHaveText("Email or password is incorrect.");
  await expect(password).toHaveValue("shortpw");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/preview\/home$/);
});

test("mocked signup requires consent and sends the chosen email and password", async ({
  page,
}) => {
  let attempts = 0;
  await page.route("**/api/auth", async (route) => {
    const payload = route.request().postDataJSON();
    expect(payload).toMatchObject({
      kind: "sign-up",
      email: "person@example.com",
      password: "FictionalPassword42!",
      adult: true,
    });
    attempts++;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Confirm your email to finish signing up.",
      }),
    });
  });
  await page.goto("/sign-up");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("person@example.com");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Password", { exact: true })
    .fill("FictionalPassword42!");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  expect(attempts).toBe(0);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Check your email.",
  );
  await expect(
    page.getByText("Confirm your email to finish signing up.", { exact: true }),
  ).toBeVisible();
  expect(attempts).toBe(1);
});

test("switching between login and signup clears the previous credentials", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("person@example.com");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Password", { exact: true })
    .fill("FictionalPassword42!");
  await page.getByRole("link", { name: "Sign up", exact: true }).click();
  await expect(page.getByLabel("Email address", { exact: true })).toHaveValue(
    "",
  );
  await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
});

test("mocked recovery sends an email request and confirms the next step", async ({
  page,
}) => {
  await page.route("**/api/auth", async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      kind: "forgot-password",
      email: "person@example.com",
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "If that account exists, a reset link is on its way.",
      }),
    });
  });
  await page.goto("/forgot-password");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("person@example.com");
  await page
    .getByRole("button", { name: "Send reset link", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Check your email.",
  );
});

test("camera-size photos are prepared as bounded WebP before preview storage", async ({
  page,
}) => {
  const image = await sharp({
    create: {
      width: 4200,
      height: 3000,
      channels: 3,
      background: "#fff",
      noise: { type: "gaussian", mean: 128, sigma: 65 },
    },
  })
    .png()
    .toBuffer();
  expect(image.length).toBeGreaterThan(4.5 * 1024 * 1024);
  const photo = await sharp(image).jpeg({ quality: 85 }).toBuffer();
  expect(photo.length).toBeGreaterThan(4.5 * 1024 * 1024);
  expect(photo.length).toBeLessThan(10 * 1024 * 1024);
  await page.goto("/preview/home");
  await expect(page.locator('[data-preview-ready="true"]')).toBeVisible();
  await page
    .getByRole("navigation", { name: "Social navigation" })
    .getByRole("button", { name: "Share post", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Your story")
    .fill("A fictional camera photo upload test.");
  await dialog.locator("input[type=file]").setInputFiles({
    name: "camera-photo.jpg",
    mimeType: "image/jpeg",
    buffer: photo,
  });
  await dialog
    .getByRole("button", { name: "Share your story", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  const img = page
    .locator(".post-card")
    .filter({ hasText: "A fictional camera photo upload test." })
    .locator(".image-media img");
  await expect(img).toBeVisible();
  const source = await img.getAttribute("src");
  expect(source).toMatch(/^data:image\/webp;base64,/);
  expect(
    Buffer.from(source!.split(",")[1], "base64").length,
  ).toBeLessThanOrEqual(3 * 1024 * 1024);
  await expect
    .poll(() => img.evaluate((node) => (node as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  const bounds = await img.evaluate((node) => ({
    width: (node as HTMLImageElement).naturalWidth,
    height: (node as HTMLImageElement).naturalHeight,
  }));
  expect(Math.max(bounds.width, bounds.height)).toBeLessThanOrEqual(2048);
});
