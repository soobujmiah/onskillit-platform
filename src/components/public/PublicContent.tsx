import Link from "next/link";
import type { Locale } from "@/i18n/locales";
import { publicMediaAlts, type PublicPage } from "@/lib/public-content";
import { brandName } from "@/lib/site-settings";

function SectionImage({ id, alt, kind }: { id: string; alt: string; kind: string }) {
  // Approved public media is served by the CMS media route; it is not a build-time asset, so next/image does not apply.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={kind === "profile" ? "public-profile-photo" : "public-section-image"} src={`/api/v1/cms/media/${id}/content`}
    alt={alt} {...(kind === "profile" ? { width: 160, height: 160 } : {})} loading="lazy" />;
}

export async function PublicContent({ page, locale }: { page: PublicPage; locale: Locale }) {
  const media = await publicMediaAlts(page.content.sections.flatMap((section) => section.mediaId ? [section.mediaId] : []), locale);
  const brand = await brandName(locale);
  return <article className={`public-article public-article-${page.key}`} lang={locale}>
    <header className="public-hero">
      <p className="public-kicker">{brand}</p>
      <h1>{page.content.title}</h1>
      <p className="public-lead">{page.content.description}</p>
    </header>
    <div className="public-sections">
      {page.content.sections.filter((section) => section.type !== "profile" || section.status !== "hidden").map((section, index) => <section key={`${section.type}-${index}`} className={`public-section public-section-${section.type}`}>
        {section.mediaId && media[section.mediaId] && <SectionImage id={section.mediaId} alt={media[section.mediaId]} kind={section.type} />}
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

export async function UnpublishedPage({ title, message, locale }: { title: string; message: string; locale: Locale }) {
  return <div className="public-empty"><p className="public-kicker">{await brandName(locale)}</p><h1>{title}</h1><p>{message}</p></div>;
}
