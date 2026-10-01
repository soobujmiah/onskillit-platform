import Link from "next/link";
import type { Locale } from "@/i18n/locales";
import type { PublicPage } from "@/lib/public-content";

export function PublicContent({ page, locale }: { page: PublicPage; locale: Locale }) {
  return <article className={`public-article public-article-${page.key}`} lang={locale}>
    <header className="public-hero">
      <p className="public-kicker">{locale === "bn" ? "অনস্কিলআইটি" : "OnSkillIT"}</p>
      <h1>{page.content.title}</h1>
      <p className="public-lead">{page.content.description}</p>
    </header>
    <div className="public-sections">
      {page.content.sections.map((section, index) => <section key={`${section.type}-${index}`} className={`public-section public-section-${section.type}`}>
        <h2>{section.heading}</h2>
        {section.type === "profile" && <p className="public-profile-role">{section.role}</p>}
        <p>{section.body}</p>
        {section.type === "cta" && section.href && <Link className="public-button" href={`/${locale}${section.href}`}>
          {section.heading}
        </Link>}
      </section>)}
    </div>
  </article>;
}

export function UnpublishedPage({ title, message, locale }: { title: string; message: string; locale: Locale }) {
  return <div className="public-empty"><p className="public-kicker">{locale === "bn" ? "অনস্কিলআইটি" : "OnSkillIT"}</p><h1>{title}</h1><p>{message}</p></div>;
}
