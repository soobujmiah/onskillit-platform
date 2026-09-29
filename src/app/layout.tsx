import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Inter, Hind_Siliguri } from "next/font/google";
import "@/styles/tokens.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-en", display: "swap" });
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OnSkillIT platform foundation",
  robots: { index: false, follow: false },
};

// Runs before paint, in <head>, synchronously: applies the theme
// cookie if present, otherwise the system preference, to <html>
// before the browser renders anything. This is what "no first-paint
// flash" (DESIGN-SYSTEM.md) means in practice for the one case SSR
// genuinely cannot resolve on its own — a first-ever visit with no
// cookie yet. No user input reaches this string; it is a fixed
// constant, not built from request data.
const NO_FLASH_THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(light|dark)/);var t=m?m[1]:null;if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const themeCookie = cookieStore.get("theme")?.value;
  const theme = themeCookie === "dark" ? "dark" : themeCookie === "light" ? "light" : undefined;
  const locale = headerStore.get("x-locale") ?? "en";

  return (
      <html lang={locale} data-theme={theme} className={`${inter.variable} ${hindSiliguri.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
