import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { database, hasPermission, readSession, sameOrigin, validCsrf } from "@/lib/identity";
import { INQUIRY_REFERENCE } from "@/lib/inquiry";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(data: object, status: number) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

/**
 * Staff redaction of one inquiry's personal fields (ADR 0011). Mirrors the operator procedure: a request case
 * reference and a different review reference are both required. The database trigger permits one redaction and
 * appends the audit event; the personal fields are not recoverable afterwards.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return json({ code: "NOT_FOUND" }, 404);
  if (!sameOrigin(request)) return json({ code: "FORBIDDEN" }, 403);
  const db = database();
  try {
    const session = await readSession(db, request);
    if (!session) return json({ code: "UNAUTHENTICATED" }, 401);
    if (!validCsrf(request, session)) return json({ code: "CSRF_REQUIRED" }, 403);
    if (!await hasPermission(db, session.userId, "inquiries.redact")) return json({ code: "FORBIDDEN" }, 403);
    if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ code: "INVALID_REQUEST" }, 400);
    let body: unknown;
    try { body = await request.json(); } catch { return json({ code: "INVALID_REQUEST" }, 400); }
    const input = body as Record<string, unknown>;
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some((key) => !["request_reference", "review_reference"].includes(key))) return json({ code: "INVALID_REQUEST" }, 400);
    const requestRef = typeof input.request_reference === "string" ? input.request_reference.trim() : "";
    const reviewRef = typeof input.review_reference === "string" ? input.review_reference.trim() : "";
    if (!INQUIRY_REFERENCE.test(requestRef) || !INQUIRY_REFERENCE.test(reviewRef) || requestRef === reviewRef) return json({ code: "INVALID_REFERENCE" }, 400);
    const outcome = await db.begin(async (tx) => {
      const rows = await tx`SELECT redacted_at FROM public_inquiry WHERE id=${id} FOR UPDATE`;
      if (!rows.length) return "NOT_FOUND";
      if (rows[0].redacted_at) return "ALREADY_REDACTED";
      await tx`UPDATE public_inquiry SET name=NULL,email=NULL,phone=NULL,message=NULL,redacted_at=now(),
        redacted_by=${`staff:${session.userId}`},redaction_request_reference=${requestRef},redaction_review_reference=${reviewRef}
        WHERE id=${id}`;
      return "OK";
    });
    if (outcome === "NOT_FOUND") return json({ code: "NOT_FOUND" }, 404);
    if (outcome === "ALREADY_REDACTED") return json({ code: "ALREADY_REDACTED" }, 409);
    return json({ status: "redacted", request_id: randomUUID() }, 200);
  } finally { await db.end(); }
}
