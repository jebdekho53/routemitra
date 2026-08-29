// Lightweight client-error sink (Phase 18 admin visibility). Superseded by
// Sentry in Phase 15. Writes to the `errors` table when DATABASE_URL is set,
// else just logs.

import { NextResponse } from "next/server";
import { sql, dbEnabled, ensureSchema } from "@/lib/db";

export async function POST(request: Request) {
  let body: { message?: string; digest?: string; path?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = (body.message || "").slice(0, 500) || "unknown";
  const digest = body.digest?.slice(0, 120) ?? null;
  const path = body.path?.slice(0, 200) ?? null;

  if (!dbEnabled || !sql) {
    console.error(`[client-error] ${message} (${digest ?? "no-digest"}) @ ${path}`);
    return NextResponse.json({ ok: true, stored: false });
  }
  try {
    await ensureSchema();
    await sql`INSERT INTO errors (message, digest, path) VALUES (${message}, ${digest}, ${path})`;
    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[client-error] insert failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
