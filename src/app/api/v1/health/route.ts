import { NextResponse } from "next/server";
import { createDbClient, getDatabaseUrl } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    return NextResponse.json(
      { status: "ok" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const sql = createDbClient(databaseUrl);
  try {
    await sql`select 1`;
    return NextResponse.json(
      { status: "ok", checks: { database: "ok" } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { status: "ok", checks: { database: "unreachable" } },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    await sql.end({ timeout: 1 });
  }
}
