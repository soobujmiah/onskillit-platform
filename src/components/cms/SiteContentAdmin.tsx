"use client";
import { useEffect, useMemo, useState } from "react";

type Text = Record<string, string>;
type Setting = { key: string; value: string };
type Asset = { id: string; filename: string; mime_type: string; public: boolean; alt_en: string; alt_bn: string };

function csrf() {
  return decodeURIComponent(document.cookie.split("; ").find((part) => part.startsWith("onskillit_csrf="))?.split("=")[1] ?? "");
}
async function post(path: string, body: object): Promise<{ ok: boolean; code?: string }> {
  try {
    const response = await fetch(`/api/v1/cms/${path}`, { method: "POST", credentials: "same-origin",
      headers: { "content-type": "application/json", "x-csrf-token": csrf() }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({})) as { code?: string };
    return { ok: response.ok, code: result.code };
  } catch { return { ok: false }; }
}

const GROUPS: Array<{ title: string; keys: string[] }> = [
  { title: "settingsBrand", keys: ["site_name_en", "site_name_bn", "footer_text_en", "footer_text_bn", "site_logo_media_id"] },
  { title: "settingsContact", keys: ["contact_email", "contact_phone", "contact_whatsapp", "contact_address_en", "contact_address_bn"] },
  { title: "settingsSocial", keys: ["facebook_url", "youtube_url"] },
];

/** Brand, footer, logo, contact and social settings. Every field saves on its own; empty restores the built-in default. */
export function SiteSettingsForm({ t }: { t: Text }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [status, setStatus] = useState<Record<string, string>>({});
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let active = true;
    void fetch("/api/v1/cms/settings", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null).then((body: { settings: Setting[] } | null) => {
        if (!active || !body) return;
        const next = Object.fromEntries(body.settings.map((row) => [row.key, row.value]));
        setSaved(next); setValues(next);
      }).catch(() => undefined);
    return () => { active = false; };
  }, [tick]);
  useEffect(() => {
    let active = true;
    void fetch("/api/v1/cms/media", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null).then((body: { assets: Asset[] } | null) => { if (active) setAssets(body ? body.assets : null); })
      .catch(() => { if (active) setAssets(null); });
    return () => { active = false; };
  }, []);
  async function save(key: string) {
    const value = (values[key] ?? "").trim();
    const result = await post("settings", { key, value });
    setStatus((current) => ({ ...current, [key]: result.ok ? t.success : (result.code && t[`error_${result.code}`]) || t.error }));
    if (result.ok) setTick((value) => value + 1);
  }
  const images = (assets ?? []).filter((asset) => asset.public && asset.mime_type.startsWith("image/") && asset.alt_en && asset.alt_bn);
  return <section className="cms-card"><p className="cms-help">{t.settingsHelp}</p>
    {GROUPS.map((group) => <fieldset key={group.title} className="cms-locale"><legend>{t[group.title]}</legend>
      {group.keys.map((key) => <div key={key} className="cms-field">
        <label htmlFor={`setting-${key}`}><span>{t[key]}</span></label>
        {key === "site_logo_media_id" && assets
          ? <select id={`setting-${key}`} value={values[key] ?? ""} onChange={(event) => setValues({ ...values, [key]: event.target.value })}>
              <option value="">{t.noLogo}</option>{images.map((asset) => <option key={asset.id} value={asset.id}>{asset.filename}</option>)}</select>
          : <input id={`setting-${key}`} value={values[key] ?? ""} onChange={(event) => setValues({ ...values, [key]: event.target.value })} />}
        <button type="button" disabled={(values[key] ?? "") === (saved[key] ?? "")} onClick={() => void save(key)}>{t.save}</button>
        {status[key] && <span role="status">{status[key]}</span>}
      </div>)}
    </fieldset>)}
  </section>;
}

type TextData = { keys: string[]; defaults: { en: Record<string, string>; bn: Record<string, string> }; texts: Array<{ locale: "en" | "bn"; key: string; value: string }> };

/** Per-language overrides for every visitor-facing label and message. Empty restores the default. */
export function SiteTextEditor({ t }: { t: Text }) {
  const [data, setData] = useState<TextData | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(20);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let active = true;
    void fetch("/api/v1/cms/site-texts", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null).then((body: TextData | null) => {
        if (!active || !body) return;
        setData(body);
        setDrafts(Object.fromEntries(body.texts.map((row) => [`${row.locale}:${row.key}`, row.value])));
      }).catch(() => undefined);
    return () => { active = false; };
  }, [tick]);
  const saved = useMemo(() => Object.fromEntries((data?.texts ?? []).map((row) => [`${row.locale}:${row.key}`, row.value])), [data]);
  const rows = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    return data.keys.filter((key) => !needle || key.toLowerCase().includes(needle)
      || (data.defaults.en[key] ?? "").toLowerCase().includes(needle) || (data.defaults.bn[key] ?? "").includes(query.trim()));
  }, [data, query]);
  async function save(locale: "en" | "bn", key: string, value: string) {
    const id = `${locale}:${key}`;
    const result = await post("site-texts", { locale, key, value: value.trim() });
    setStatus((current) => ({ ...current, [id]: result.ok ? t.success : (result.code && t[`error_${result.code}`]) || t.error }));
    if (result.ok) setTick((value) => value + 1);
  }
  if (!data) return null;
  return <section className="cms-card"><h2>{t.textsHeading}</h2><p className="cms-help">{t.textsHelp}</p>
    <label className="cms-field"><span>{t.textsSearch}</span><input value={query} onChange={(event) => { setQuery(event.target.value); setLimit(20); }} /></label>
    <ul className="cms-list">{rows.slice(0, limit).map((key) => <li key={key}><code>{key}</code>
      {(["en", "bn"] as const).map((locale) => {
        const id = `${locale}:${key}`;
        return <div key={locale} className="cms-field">
          <label htmlFor={`text-${id}`}><span>{locale === "en" ? t.textsEnglish : t.textsBangla}</span></label>
          <input id={`text-${id}`} lang={locale} value={drafts[id] ?? ""} placeholder={data.defaults[locale][key]}
            onChange={(event) => setDrafts({ ...drafts, [id]: event.target.value })} />
          <button type="button" disabled={(drafts[id] ?? "") === (saved[id] ?? "")} onClick={() => void save(locale, key, drafts[id] ?? "")}>{t.save}</button>
          {saved[id] !== undefined && <button type="button" onClick={() => void save(locale, key, "")}>{t.textsReset}</button>}
          {status[id] && <span role="status">{status[id]}</span>}
        </div>;
      })}</li>)}</ul>
    {rows.length > limit && <button type="button" onClick={() => setLimit(limit + 20)}>{t.textsMore}</button>}
  </section>;
}
