import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { Db } from "@/lib/identity";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type LocaleContent = {
  title: string; slug: string; description: string; seoTitle: string; seoDescription: string;
  sections: Array<{ type: "hero" | "text" | "cta" | "profile"; heading: string; body: string; role?: string; href?: string; mediaId?: string; source: string;
    skills?: string[]; links?: Array<{ label: string; url: string }>; relationship?: string; status?: "active" | "hidden" }>;
};
const PROFILE_ONLY = ["skills","links","relationship","status"] as const;
function profileExtras(s: Record<string, unknown>, locale: "en"|"bn"): boolean {
  if (s.type !== "profile") return PROFILE_ONLY.every((key) => s[key] === undefined);
  if (s.skills !== undefined) {
    if (!Array.isArray(s.skills) || s.skills.length > 12) return false;
    for (const skill of s.skills) if (typeof skill !== "string" || !skill.trim() || skill.length > 80 || !localeProse(skill,locale)) return false;
  }
  if (s.links !== undefined) {
    if (!Array.isArray(s.links) || s.links.length > 6) return false;
    for (const link of s.links) {
      if (!link || typeof link !== "object" || Array.isArray(link)) return false;
      const l = link as Record<string, unknown>;
      if (Object.keys(l).some((key) => key !== "label" && key !== "url")) return false;
      if (typeof l.label !== "string" || !l.label.trim() || l.label.length > 60 || !localeProse(l.label,locale)) return false;
      if (typeof l.url !== "string" || l.url.length > 300 || /\s/.test(l.url)) return false;
      try { if (new URL(l.url).protocol !== "https:") return false; } catch { return false; }
    }
  }
  if (s.relationship !== undefined && (typeof s.relationship !== "string" || s.relationship.length > 200 || !localeProse(s.relationship,locale))) return false;
  if (s.status !== undefined && s.status !== "active" && s.status !== "hidden") return false;
  return true;
}
/**
 * Deployment-level CMS workflow (ADR 0012). `separated` (default, fail-closed) requires a reviewer different from
 * the author and a publisher different from both. `single_operator` lets one authorized person hold the author,
 * reviewer and publisher steps; the explicit approved-review step, permissions and audit trail still apply.
 * It is environment configuration, so staff cannot weaken it through the web interface.
 */
export type WorkflowMode = "separated" | "single_operator";
export function workflowMode(): WorkflowMode {
  return process.env.CMS_WORKFLOW_MODE === "single_operator" ? "single_operator" : "separated";
}
export function localeProse(value: string, locale: "en"|"bn") {
  if (!value.trim()) return true;
  return locale === "en" ? !/[\u0980-\u09ff]/u.test(value) && /[A-Za-z]/.test(value)
    : !/[A-Za-z]/.test(value) && /[\u0980-\u09ff]/u.test(value);
}
export function content(value: unknown, complete: boolean, locale: "en"|"bn"): value is LocaleContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some((key) => !["title","slug","description","seoTitle","seoDescription","sections"].includes(key))) return false;
  for (const key of ["title","slug","description","seoTitle","seoDescription"]) {
    if (typeof v[key] !== "string" || v[key].length > (key === "description" || key === "seoDescription" ? 500 : 160)) return false;
  }
  for (const key of ["title","description","seoTitle","seoDescription"])
    if (!localeProse(v[key] as string,locale)) return false;
  if (v.slug !== "" && !/^[a-z0-9][a-z0-9-]{0,79}$/.test(v.slug as string)) return false;
  if (!Array.isArray(v.sections) || v.sections.length > 20) return false;
  for (const item of v.sections) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const s = item as Record<string, unknown>;
    if (Object.keys(s).some((key) => !["type","heading","body","role","href","mediaId","source",...PROFILE_ONLY].includes(key))) return false;
    if (!["hero","text","cta","profile"].includes(String(s.type)) || typeof s.heading !== "string" ||
      typeof s.body !== "string" || typeof s.source !== "string" ||
      s.heading.length > 160 || s.body.length > 4000 || s.source.length > 500) return false;
    if (s.type === "profile" ? typeof s.role !== "string" || s.role.length > 160 || !localeProse(s.role,locale) || (complete && !s.role.trim()) : s.role !== undefined) return false;
    if (!profileExtras(s,locale)) return false;
    if (s.href !== undefined && (s.type !== "cta" || typeof s.href !== "string" || !/^\/(?!\/)[a-z0-9/-]{0,200}$/.test(s.href))) return false;
    if (s.mediaId !== undefined && (s.type === "cta" || typeof s.mediaId !== "string" || !UUID.test(s.mediaId))) return false;
    if (!localeProse(s.heading,locale) || !localeProse(s.body,locale)) return false;
    if (complete && (!s.heading.trim() || !s.body.trim() || !s.source.trim() || (s.type === "cta" && !s.href))) return false;
  }
  return !complete || !!(String(v.title).trim() && String(v.slug).trim() && String(v.description).trim() &&
    String(v.seoTitle).trim() && String(v.seoDescription).trim() && v.sections.length);
}
export function mimeOf(bytes: Buffer): string | null {
  if (bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "image/png";
  if (bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (bytes.toString("ascii",0,4) === "RIFF" && bytes.toString("ascii",8,12) === "WEBP") return "image/webp";
  if (bytes.toString("ascii",0,5) === "%PDF-") return "application/pdf";
  return null;
}
export function hash(bytes: Buffer) { return createHash("sha256").update(bytes).digest("hex"); }
export async function audit(db: Db, actor: string, action: string, target: string | null, requestId: string, metadata: Record<string,string> = {}) {
  await db`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,request_id,metadata)
    VALUES (${actor},${target},${action},'success',${requestId || randomUUID()},${db.json(metadata)})`;
}
