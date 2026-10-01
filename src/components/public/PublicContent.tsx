import Link from "next/link";
import type { Locale } from "@/i18n/locales";
import type { PublicPage } from "@/lib/public-content";

function ProfilePhoto({ id, alt }: { id: string; alt: string }) {
  // Approved public media is served by the CMS media route; it is not a build-time asset, so next/image does not apply.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="public-profile-photo" src={`/api/v1/cms/media/${id}/content`} alt={alt} width={160} height={160} loading="lazy" />;
}

export function PublicContent({ page, locale, media = {} }: { page: PublicPage; locale: Locale; media?: Record<string, string> }) {
  return <article className={`public-article public-article-${page.key}`} lang={locale}>
    <header className="public-hero">
      <p className="public-kicker">{locale === "bn" ? "অনস্কিলআইটি" : "OnSkillIT"}</p>
      <h1>{page.content.title}</h1>
      <p className="public-lead">{page.content.description}</p>
    </header>
    <div className="public-sections">
      {page.content.sections.filter((section) => section.type !== "profile" || section.status !== "hidden").map((section, index) => <section key={`${section.type}-${index}`} className={`public-section public-section-${section.type}`}>
        {section.type === "profile" && section.mediaId && media[section.mediaId] && <ProfilePhoto id={section.mediaId} alt={media[section.mediaId]} />}
        <h2>{section.heading}</h2>
        {section.type === "profile" && <p className="public-profile-role">{section.role}</p>}
        {section.type === "profile" && section.relationship && <p className="public-profile-relationship">{section.relationship}</p>}
        <p>{section.body}</p>
        {section.type === "profile" && section.skills && section.skills.length > 0 && <ul className="public-profile-skills">
          {section.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>}
        {section.type === "profile" && section.links && section.links.length > 0 && <ul className="public-profile-links">
          {section.links.map((link) => <li key={link.url}><a href={link.url} rel="noopener noreferrer">{link.label}</a></li>)}</ul>}
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
