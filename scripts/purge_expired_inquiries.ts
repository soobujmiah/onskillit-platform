/**
 * Operator-only retention procedure (ADR 0011). Inquiries are kept up to 12 months; this redacts the personal
 * fields of inquiries older than that, using the same audited redaction path as a privacy request. It is a dry
 * run unless INQUIRY_PURGE_APPLY=yes. Never expose it through HTTP. Run it on a regular schedule chosen by the
 * operator; the application itself does not schedule it.
 *
 * Required env: DATABASE_URL, OPERATOR_IDENTITY, OPERATOR_REVIEW_REFERENCE. Apply also needs INQUIRY_PURGE_APPLY=yes.
 */
import postgres from "postgres";

const RETENTION_MONTHS = 12;
const databaseUrl = process.env.DATABASE_URL;
const operator = process.env.OPERATOR_IDENTITY?.trim();
const review = process.env.OPERATOR_REVIEW_REFERENCE?.trim();
const apply = process.env.INQUIRY_PURGE_APPLY === "yes";
const reference = /^[a-zA-Z0-9][a-zA-Z0-9._-]{3,99}$/;

if (!databaseUrl || !operator || !review) throw new Error("DATABASE_URL, OPERATOR_IDENTITY and OPERATOR_REVIEW_REFERENCE are required");
if (operator.length > 200 || !reference.test(review)) throw new Error("Invalid operator context");

async function main(url: string, operatorIdentity: string, reviewRef: string) {
  const db = postgres(url, { max: 1 });
  try {
    const due = await db`SELECT count(*)::int AS n FROM public_inquiry
      WHERE redacted_at IS NULL AND created_at < now() - ${RETENTION_MONTHS} * interval '1 month'`;
    if (!apply) {
      process.stdout.write(`Dry run: ${due[0].n} inquiry record(s) are past ${RETENTION_MONTHS} months. Set INQUIRY_PURGE_APPLY=yes to redact them.\n`);
      return;
    }
    const requestRef = `retention-expiry:${new Date().toISOString().slice(0, 10)}`;
    const changed = await db.begin(async (tx) => {
      const rows = await tx`UPDATE public_inquiry SET name=NULL,email=NULL,phone=NULL,message=NULL,redacted_at=now(),
        redacted_by=${operatorIdentity},redaction_request_reference=${requestRef},redaction_review_reference=${reviewRef}
        WHERE redacted_at IS NULL AND created_at < now() - ${RETENTION_MONTHS} * interval '1 month' RETURNING id`;
      return rows.length;
    });
    process.stdout.write(`Retention redaction applied to ${changed} inquiry record(s).\n`);
  } finally { await db.end(); }
}

main(databaseUrl, operator, review).catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Retention redaction failed"}\n`);
  process.exitCode = 1;
});
