import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const locale of ["en","bn"] as const) {
  test(`${locale} CMS staff workspace remains accessible at mobile width`, async ({page},testInfo)=>{
    await page.setViewportSize({width:320,height:800});
    if(locale==="bn") await page.context().addCookies([{name:"theme",value:"dark",url:"http://localhost:3000"}]);
    await page.goto(`/${locale}/account/sign-in`);
    await page.getByLabel(locale==="bn"?"ইমেইল অথবা আন্তর্জাতিক মোবাইল নম্বর":"Email or international mobile number").fill("cms-author@example.test");
    await page.getByLabel(locale==="bn"?"গোপনশব্দ":"Password",{exact:true}).fill("A secure sample password 123");
    await page.getByRole("button",{name:locale==="bn"?"এগিয়ে যান":"Continue"}).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/learn/profile$`));
    const routes=[
      ["content/pages",locale==="bn"?"পাতাসমূহ":"Pages","pages"],
      ["content/navigation",locale==="bn"?"দিকনির্দেশনা":"Navigation","navigation"],
      ["content/media",locale==="bn"?"মাধ্যম ভান্ডার":"Media library","media"],
      ["content/seo",locale==="bn"?"অনুসন্ধান সেটিংস":"Search settings","seo"],
      ["settings/site",locale==="bn"?"সাইট সেটিংস":"Site settings","settings"],
    ] as const;
    for(const [route,title,name] of routes){
      await page.goto(`/${locale}/staff/${route}`);
      await expect(page.getByRole("heading",{name:title,level:1})).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang",locale);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      await page.screenshot({path:testInfo.outputPath(`${name}.png`),fullPage:true});
      const results=await new AxeBuilder({page}).analyze();expect(results.violations).toEqual([]);
    }
    await page.goto(`/${locale}/staff/content/pages`);
    await page.getByRole("link",{name:"cms-showcase"}).click();
    await expect(page.getByRole("heading",{name:locale==="bn"?"পাতা সম্পাদনা":"Page editor",level:1})).toBeVisible();
    await page.getByRole("button",{name:locale==="bn"?"আগাম দেখুন":"Preview"}).click();
    await expect(page.getByText(locale==="bn"?"শুধু কর্মীদের আগাম দেখা। অপ্রকাশিত বিষয় সবার জন্য নয়।":"Staff preview only. Unpublished content is not public.")).toBeVisible();
    await page.screenshot({path:testInfo.outputPath("editor-preview.png"),fullPage:true});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    const results=await new AxeBuilder({page}).analyze();expect(results.violations).toEqual([]);
  });
}
