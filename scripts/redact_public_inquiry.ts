/**
 * Operator-only privacy procedure. The protected operator environment must
 * authenticate the operator and retain the requester's identity check plus an
 * independent review reference. Never expose this script through HTTP.
 */
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
const inquiryId = process.env.INQUIRY_ID?.trim();
const operator = process.env.OPERATOR_IDENTITY?.trim();
const requestReference = process.env.PRIVACY_REQUEST_REFERENCE?.trim();
const reviewReference = process.env.PRIVACY_REVIEW_REFERENCE?.trim();
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const reference = /^[a-zA-Z0-9][a-zA-Z0-9._-]{3,99}$/;

if (!databaseUrl || !inquiryId || !operator || !requestReference || !reviewReference ||
  process.env.PRIVACY_REDACTION_APPROVED !== "yes") {
  throw new Error("Reviewed privacy request and operator approval marker are required");
}
if (!uuid.test(inquiryId) || operator.length > 200 || !reference.test(requestReference) ||
  !reference.test(reviewReference) || requestReference === reviewReference) {
  throw new Error("Invalid inquiry redaction context");
}

async function main(url: string, id: string, operatorIdentity: string, requestRef: string, reviewRef: string) {
  const db = postgres(url, { max: 1 });
  try {
    await db.begin(async (tx) => {
      const rows = await tx`SELECT id,redacted_at FROM public_inquiry WHERE id=${id} FOR UPDATE`;
      if (rows.length !== 1 || rows[0].redacted_at) throw new Error("Inquiry not found or already redacted");
      await tx`UPDATE public_inquiry SET name=NULL,email=NULL,phone=NULL,message=NULL,
        redacted_at=now(),redacted_by=${operatorIdentity},
        redaction_request_reference=${requestRef},redaction_review_reference=${reviewRef}
        WHERE id=${id}`;
    });
    process.stdout.write(`Inquiry personal fields redacted: ${id}\n`);
  } finally {
    await db.end();
  }
}

main(databaseUrl, inquiryId, operator, requestReference, reviewReference).catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Inquiry redaction failed"}\n`);
  process.exitCode = 1;
});
