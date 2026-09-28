import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("locale routing", () => {
  test("root redirects to /en with English content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("OnSkillIT platform foundation");
  });

  test("/bn renders Bangla content with lang=bn", async ({ page }) => {
    await page.goto("/bn");
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("অনস্কিলআইটি প্ল্যাটফর্ম ভিত্তি");
  });

  test("language switcher moves between locales", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: "Switch to Bangla" }).click();
    await expect(page).toHaveURL(/\/bn$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  });
});

test.describe("theme — no first-paint flash", () => {
  test("dark cookie is honored in the raw SSR response, not just after client JS runs", async ({ request }) => {
    const response = await request.get("/en", { headers: { cookie: "theme=dark" } });
    const html = await response.text();
    expect(html).toMatch(/<html[^>]*data-theme="dark"/);
  });

  test("light cookie is honored the same way", async ({ request }) => {
    const response = await request.get("/en", { headers: { cookie: "theme=light" } });
    const html = await response.text();
    expect(html).toMatch(/<html[^>]*data-theme="light"/);
  });

  test("toggle flips the theme immediately and persists the cookie", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const cookies = await page.context().cookies();
    expect(cookies.find((cookie) => cookie.name === "theme")?.value).toBe("dark");
  });
});

test.describe("keyboard and focus", () => {
  test("tab order reaches skip link, then language switcher, then theme toggle", async ({ page }) => {
    await page.goto("/en");
    await page.keyboard.press("Tab");
    await expect(page.locator(".skip-link")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Switch to Bangla" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Toggle theme" })).toBeFocused();
  });
});

test.describe("viewport", () => {
  for (const width of [320, 768, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("accessibility (includes color-contrast)", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`zero axe violations — ${theme} theme, /en`, async ({ page }) => {
      if (theme === "dark") {
        await page.context().addCookies([{ name: "theme", value: "dark", url: "http://localhost:3000" }]);
      }
      await page.goto("/en");
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });

    test(`zero axe violations — ${theme} theme, /bn`, async ({ page }) => {
      if (theme === "dark") {
        await page.context().addCookies([{ name: "theme", value: "dark", url: "http://localhost:3000" }]);
      }
      await page.goto("/bn");
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
