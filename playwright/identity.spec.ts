import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Phase 3 public account pages", () => {
  for (const locale of ["en", "bn"] as const) {
    for (const theme of ["light", "dark"] as const) {
      test(`${locale} ${theme} sign-in is accessible at mobile width`, async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 800 });
        if (theme === "dark") await page.context().addCookies([{ name: "theme", value: "dark", url: "http://localhost:3000" }]);
        await page.goto(`/${locale}/account/sign-in`);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }

  test("register, sign in and reach own profile", async ({ page }) => {
    const email = `browser-${Date.now()}@example.test`;
    await page.goto("/en/account/register");
    await page.getByLabel("Email or international mobile number").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Browser sample password 123");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/en\/account\/sign-in$/);
    await page.getByLabel("Email or international mobile number").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Browser sample password 123");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/en\/learn\/profile$/);
    await expect(page.getByRole("heading", { name: "Profile and security" })).toBeVisible();
    await page.goto("/en/staff/users");
    await expect(page).toHaveURL(/\/en\/forbidden$/);
  });

  test("language switch preserves account route and verification token", async ({ page }) => {
    const token = `v_${"a".repeat(43)}`;
    await page.goto(`/en/account/reset/${token}`);
    await page.getByRole("link", { name: "Switch to Bangla" }).click();
    await expect(page).toHaveURL(new RegExp(`/bn/account/reset/${token}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ইমেইল যাচাই");
  });

  test("staff shell shows scoped queues to the synthetic owner", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.context().addCookies([{ name: "theme", value: "dark", url: "http://localhost:3000" }]);
    await page.goto("/en/account/sign-in");
    await page.getByLabel("Email or international mobile number").fill("owner@example.test");
    await page.getByLabel("Password", { exact: true }).fill("A secure sample password 123");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/en\/learn\/profile$/);
    await page.goto("/en/staff");
    await expect(page).toHaveURL(/\/en\/staff\/users$/);
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Audit log" })).toBeVisible();
    await page.goto("/bn/staff/users");
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.getByRole("heading", { name: "ব্যবহারকারী" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
