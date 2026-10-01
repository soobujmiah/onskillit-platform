import "server-only";
import type { Db } from "@/lib/identity";

/** Owner-approved retention rule (2026-10-01): up to 12 months, or earlier if deletion is requested. */
export const INQUIRY_RETENTION_MONTHS = 12;
/** Same shape the operator redaction script requires for case and review references. */
export const INQUIRY_REFERENCE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{3,99}$/;

export type InquiryRow = {
  id: string; name: string | null; email: string | null; phone: string | null; message: string | null;
  locale: "en" | "bn"; source_path: string; consent_version: string; created_at: Date; redacted_at: Date | null;
  service_key: string | null; retention_due: boolean;
};

/** Newest first; 50 per page. Callers must already have checked the `inquiries.read` permission. */
export async function listInquiries(db: Db, cursorId?: string) {
  const after = cursorId ? db`WHERE (i.created_at,i.id) < (SELECT created_at,id FROM public_inquiry WHERE id=${cursorId})` : db``;
  const rows = await db<InquiryRow[]>`SELECT i.id,i.name,i.email,i.phone,i.message,i.locale,i.source_path,i.consent_version,
      i.created_at,i.redacted_at,p.page_key AS service_key,
      (i.redacted_at IS NULL AND i.created_at < now() - ${INQUIRY_RETENTION_MONTHS} * interval '1 month') AS retention_due
    FROM public_inquiry i LEFT JOIN cms_page p ON p.id=i.service_page_id
    ${after} ORDER BY i.created_at DESC,i.id DESC LIMIT 51`;
  return { items: rows.slice(0, 50), nextId: rows.length > 50 ? rows[49].id : null };
}
