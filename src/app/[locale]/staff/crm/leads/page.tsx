import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";
import { hasAnyPermission, hasPermission } from "@/lib/identity";
import { privateIdentity } from "@/lib/identity-page";
import { decodeCursor } from "@/lib/identity-list";
import { listInquiries } from "@/lib/inquiry";
import { InquiryRedactionAction } from "@/components/staff/InquiryRedaction";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: isLocale(locale) ? getDictionary(locale).inquiries.title : "Inquiries", robots: { index: false, follow: false } };
}

export default async function StaffInquiries({ params, searchParams }: {
  params: Promise<{ locale: string }>; searchParams: Promise<{ cursor?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const cursor = decodeCursor((await searchParams).cursor);
  if (cursor === null) notFound();
  const { db, session } = await privateIdentity(locale);
  try {
    if (!await hasAnyPermission(db, session.userId, "inquiries.read")) redirect(`/${locale}/forbidden`);
    const dictionary = getDictionary(locale);
    const t = dictionary.inquiries;
    const canRedact = await hasPermission(db, session.userId, "inquiries.redact");
    const page = await listInquiries(db, cursor?.id);
    const when = (value: Date) => new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US",
      { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(value));
    return <section className="identity-panel"><h1>{t.title}</h1>
      <p className="cms-help">{t.intro}</p><p className="cms-help">{t.retentionNote}</p>
      {page.items.length ? <ul>{page.items.map((row) => <li key={row.id} className="identity-record inquiry-record">
        <strong>{t.received}: {when(row.created_at)}</strong> · {t.language}: {row.locale} · {t.page}: {row.source_path}
        {row.service_key && <> · {t.service}: {row.service_key}</>}<br />
        {row.redacted_at ? <em>{t.redactedState}</em> : <>
          {t.name}: {row.name}<br />{t.email}: {row.email}<br />{row.phone && <>{t.phone}: {row.phone}<br /></>}
          <span className="inquiry-message">{row.message}</span></>}
        {row.retention_due && <p role="note"><strong>{t.retentionDue}</strong></p>}
        {canRedact && !row.redacted_at && <InquiryRedactionAction inquiryId={row.id} dictionary={dictionary} />}
      </li>)}</ul> : <p>{t.empty}</p>}
      {page.nextId && <Link href={`/${locale}/staff/crm/leads?cursor=${encodeURIComponent(Buffer.from(JSON.stringify({ id: page.nextId })).toString("base64url"))}`}>{dictionary.identity.nextPage}</Link>}
    </section>;
  } finally { await db.end(); }
}
