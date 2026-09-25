import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OnSkillIT platform foundation",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
