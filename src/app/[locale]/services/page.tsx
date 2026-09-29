import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";
import { publishedPage, publishedServices } from "@/lib/public-content";
import { publicMetadata } from "@/lib/public-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return { robots: { index: false } };
  return publicMetadata(await publishedPage("services", locale), locale, `/${locale}/services`);
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [page, services] = await Promise.all([publishedPage("services", locale), publishedServices(locale)]);
  const t = getDictionary(locale).public;
  return <div className="public-article">
    <header className="public-hero"><p className="public-kicker">OnSkillIT</p><h1>{page?.content.title ?? t.services}</h1>
      {page && <p className="public-lead">{page.content.description}</p>}</header>
    {services.length ? <ul className="public-card-grid">{services.map((service) => <li key={service.key} className="public-card">
      <h2>{service.content.title}</h2><p>{service.content.description}</p>
      <Link href={`/${locale}/services/${service.content.slug}`}>{t.serviceLink}</Link>
    </li>)}</ul> : <p className="public-empty-note">{t.noServices}</p>}
  </div>;
}
