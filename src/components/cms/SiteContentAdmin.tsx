"use client";
import { useEffect, useMemo, useState } from "react";

type Text = Record<string, string>;
type Setting = { key: string; value: string };
type Asset = { id: string; filename: string; mime_type: string; public: boolean; alt_en: string; alt_bn: string };
type Change = { id: string; kind: "setting" | "text"; locale: "en" | "bn" | null; key: string; value: string; proposed_by: string;
  decision: "approved" | "rejected" | null; review_note: string | null; published_at: string | null };
type Viewer = { id: string; can_propose: boolean; can_review: boolean; can_publish: boolean };

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
const failure = (t: Text, code?: string) => (code && t[`error_${code}`]) || t.error;

const GROUPS: Array<{ title: string; keys: string[] }> = [
  { title: "settingsBrand", keys: ["site_name_en", "site_name_bn", "footer_text_en", "footer_text_bn", "site_logo_media_id"] },
  { title: "settingsContact", keys: ["contact_email", "contact_phone", "contact_whatsapp", "contact_address_en", "contact_address_bn"] },
  { title: "settingsSocial", keys: ["facebook_url", "youtube_url"] },
];

/** One screen: propose changes to visitor-facing site content, then review and publish them. */
export function SiteContentAdmin({ t }: { t: Text }) {
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((value) => value + 1);
  return <>
    <SiteChangesPanel t={t} version={version} bump={bump} />
    <SiteSettingsForm t={t} version={version} bump={bump} />
    <SiteTextEditor t={t} version={version} bump={bump} />
  </>;
}

function SiteChangesPanel({ t, version, bump }: { t: Text; version: number; bump: () => void }) {
  const [changes, setChanges] = useState<Change[]>([]);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Record<string, string>>({});
  useEffect(() => {
    let active = true;
    void fetch("/api/v1/cms/site-changes", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null).then((body: { changes: Change[]; viewer: Viewer } | null) => {
        if (!active || !body) return;
        setChanges(body.changes); setViewer(body.viewer);
      }).catch(() => undefined);
    return () => { active = false; };
  }, [version]);
  async function act(id: string, path: string, body: object) {
    const result = await post(`site-changes/${id}/${path}`, body);
    setStatus((current) => ({ ...current, [id]: result.ok ? t.success : failure(t, result.code) }));
    if (result.ok) bump();
  }
  const label = (change: Change) => change.kind === "setting" ? t[change.key] ?? change.key : `${change.locale}:${change.key}`;
  const state = (change: Change) => change.published_at ? t.statusPublished : change.decision === "rejected" ? t.statusRejected
    : change.decision === "approved" ? t.statusApproved : t.statusPending;
  return <section className="cms-card"><h2>{t.changesHeading}</h2><p className="cms-help">{t.changesHelp}</p>
    {changes.length === 0 ? <p>{t.noChanges}</p> : <ul className="cms-list">{changes.slice(0, 30).map((change) => <li key={change.id}>
      <strong>{label(change)}</strong> — <span className="cms-badge">{state(change)}</span><br />
      <span lang={change.locale ?? undefined}>{change.value === "" ? t.changeReset : change.value}</span>
      {change.review_note && <p className="cms-help">{change.review_note}</p>}
      {viewer && !change.decision && viewer.can_review && <div className="cms-field">
        <label htmlFor={`note-${change.id}`}><span>{t.reviewNote}</span></label>
        <input id={`note-${change.id}`} value={notes[change.id] ?? ""} maxLength={500} onChange={(event) => setNotes({ ...notes, [change.id]: event.target.value })} />
        <button type="button" disabled={!(notes[change.id] ?? "").trim()} onClick={() => void act(change.id, "reviews", { decision: "approved", note: notes[change.id] })}>{t.approve}</button>
        <button type="button" disabled={!(notes[change.id] ?? "").trim()} onClick={() => void act(change.id, "reviews", { decision: "rejected", note: notes[change.id] })}>{t.reject}</button>
      </div>}
      {viewer && change.decision === "approved" && !change.published_at && viewer.can_publish &&
        <button type="button" onClick={() => void act(change.id, "publish", {})}>{t.publish}</button>}
      {status[change.id] && <span role="status"> {status[change.id]}</span>}
    </li>)}</ul>}
  </section>;
}

/** Live values with a propose button per field; empty proposes restoring the built-in default. */
function SiteSettingsForm({ t, version, bump }: { t: Text; version: number; bump: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [live, setLive] = useState<Record<string, string>>({});
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [status, setStatus] = useState<Record<string, string>>({});
  useEffect(() => {
    let active = true;
    void fetch("/api/v1/cms/settings", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null).then((body: { settings: Setting[] } | null) => {
        if (!active || !body) return;
        const next = Object.fromEntries(body.settings.map((row) => [row.key, row.value]));
        setLive(next); setValues(next);
      }).catch(() => undefined);
    return () => { active = false; };
  }, [version]);
  useEffect(() => {
    let active = true;
    void fetch("/api/v1/cms/media", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null).then((body: { assets: Asset[] } | null) => { if (active) setAssets(body ? body.assets : null); })
      .catch(() => { if (active) setAssets(null); });
    return () => { active = false; };
  }, []);
  async function propose(key: string) {
    const result = await post("site-changes", { kind: "setting", key, value: (values[key] ?? "").trim() });
    setStatus((current) => ({ ...current, [key]: result.ok ? t.proposed : failure(t, result.code) }));
    if (result.ok) bump();
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
        <button type="button" disabled={(values[key] ?? "") === (live[key] ?? "")} onClick={() => void propose(key)}>{t.propose}</button>
        {status[key] && <span role="status">{status[key]}</span>}
      </div>)}
    </fieldset>)}
  </section>;
}

type TextData = { keys: string[]; defaults: { en: Record<string, string>; bn: Record<string, string> }; texts: Array<{ locale: "en" | "bn"; key: string; value: string }> };

/** Per-language visitor-facing text. Proposing an empty value proposes restoring the default. */
function SiteTextEditor({ t, version, bump }: { t: Text; version: number; bump: () => void }) {
  const [data, setData] = useState<TextData | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(20);
  useEffect(() => {
    let active = true;
    void fetch("/api/v1/cms/site-texts", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null).then((body: TextData | null) => {
        if (!active || !body) return;
        setData(body);
        setDrafts(Object.fromEntries(body.texts.map((row) => [`${row.locale}:${row.key}`, row.value])));
      }).catch(() => undefined);
    return () => { active = false; };
  }, [version]);
  const live = useMemo(() => Object.fromEntries((data?.texts ?? []).map((row) => [`${row.locale}:${row.key}`, row.value])), [data]);
  const rows = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    return data.keys.filter((key) => !needle || key.toLowerCase().includes(needle)
      || (data.defaults.en[key] ?? "").toLowerCase().includes(needle) || (data.defaults.bn[key] ?? "").includes(query.trim()));
  }, [data, query]);
  async function propose(locale: "en" | "bn", key: string, value: string) {
    const id = `${locale}:${key}`;
    const result = await post("site-changes", { kind: "text", locale, key, value: value.trim() });
    setStatus((current) => ({ ...current, [id]: result.ok ? t.proposed : failure(t, result.code) }));
    if (result.ok) bump();
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
          <button type="button" disabled={(drafts[id] ?? "") === (live[id] ?? "")} onClick={() => void propose(locale, key, drafts[id] ?? "")}>{t.propose}</button>
          {live[id] !== undefined && <button type="button" onClick={() => void propose(locale, key, "")}>{t.textsReset}</button>}
          {status[id] && <span role="status">{status[id]}</span>}
        </div>;
      })}</li>)}</ul>
    {rows.length > limit && <button type="button" onClick={() => setLimit(limit + 20)}>{t.textsMore}</button>}
  </section>;
}
