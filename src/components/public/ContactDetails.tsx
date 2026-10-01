import type { Locale } from "@/i18n/locales";
import { CONTACT_DEFAULTS, siteSettings } from "@/lib/site-settings";

type Labels = { email: string; phoneContact: string; address: string; whatsapp: string; facebook: string; youtube: string };

/** Contact block. Every value comes from CMS site settings; the owner-confirmed values are only the built-in fallback. */
export async function ContactDetails({ labels, locale }: { labels: Labels; locale: Locale }) {
  const s = await siteSettings();
  const email = s.contact_email ?? CONTACT_DEFAULTS.contact_email;
  const phone = s.contact_phone ?? CONTACT_DEFAULTS.contact_phone;
  const whatsapp = s.contact_whatsapp ?? CONTACT_DEFAULTS.contact_whatsapp;
  const facebook = s.facebook_url ?? CONTACT_DEFAULTS.facebook_url;
  const youtube = s.youtube_url ?? CONTACT_DEFAULTS.youtube_url;
  const address = locale === "bn" && s.contact_address_bn ? { text: s.contact_address_bn, lang: "bn" }
    : { text: s.contact_address_en ?? CONTACT_DEFAULTS.contact_address_en, lang: "en" };
  return <section className="public-contact-details" aria-label={labels.address}>
    <div><h2>{labels.email}</h2><a href={`mailto:${email}`}>{email}</a></div>
    <div><h2>{labels.phoneContact}</h2><a href={`tel:${phone.replace(/[^+0-9]/g, "")}`}>{phone}</a><a href={`https://wa.me/${whatsapp}`} rel="noopener noreferrer">{labels.whatsapp}</a></div>
    <div><h2>{labels.address}</h2><address lang={address.lang}>{address.text}</address></div>
    <div><h2>{labels.facebook}</h2><a href={facebook} rel="noopener noreferrer">{labels.facebook}</a></div>
    <div><h2>{labels.youtube}</h2><a href={youtube} rel="noopener noreferrer">{labels.youtube}</a></div>
  </section>;
}
