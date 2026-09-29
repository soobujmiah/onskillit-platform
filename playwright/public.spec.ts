import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const locale of ["en", "bn"] as const) {
  for (const width of [320, 1440]) {
    test(`${locale} public core at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      if (locale === "bn") await page.context().addCookies([{ name: "theme", value: "dark", url: "http://localhost:3000" }]);
      for (const path of ["", "about", "services", "services/hospital-clinic", "contact", "faq", "privacy", "terms", "accessibility"]) {
        await page.goto(path ? `/${locale}/${path}` : `/${locale}`);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
        await page.screenshot({ path: testInfo.outputPath(`${path ? path.replaceAll("/", "-") : "home"}.png`), fullPage: true });
      }
      await page.goto(`/${locale}/contact`);
      await expect(page.getByRole("link", { name: "onskillitbd@gmail.com" })).toHaveAttribute("href", "mailto:onskillitbd@gmail.com");
      await expect(page.getByRole("link", { name: "+8801617301184" })).toHaveAttribute("href", "tel:+8801617301184");
      await expect(page.getByRole("button", { name: locale === "bn" ? "অনুরোধ পাঠান" : "Send inquiry" })).toBeVisible();
      await page.goto(`/${locale}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale === "bn"
        ? "বাংলাদেশের ব্যবসার জন্য সফটওয়্যার ও দক্ষতা"
        : "Software and skills for growing Bangladeshi businesses");
    });
  }
}
