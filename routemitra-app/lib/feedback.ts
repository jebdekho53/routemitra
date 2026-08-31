// Phase 21 — feedback / support inbox. DB-backed when DATABASE_URL is set;
// otherwise every submission is logged to the server console so nothing is
// silently lost in a no-DB deploy.

import { sql, ensureSchema, dbEnabled } from "@/lib/db";

export interface FeedbackRow {
  id: string;
  created_at: string;
  kind: string;
  message: string;
  email: string | null;
  page: string | null;
  user_id: string | null;
  status: string;
}

export interface NewFeedback {
  kind: string;
  message: string;
  email?: string | null;
  page?: string | null;
  userId?: string | null;
  userAgent?: string | null;
}

export async function createFeedback(f: NewFeedback): Promise<void> {
  if (!dbEnabled || !sql) {
    console.log(
      `[feedback:no-db] ${f.kind} — ${f.message}${f.email ? ` <${f.email}>` : ""}${
        f.page ? ` (${f.page})` : ""
      }`,
    );
    return;
  }
  await ensureSchema();
  await sql`
    INSERT INTO feedback (kind, message, email, page, user_id, user_agent)
    VALUES (
      ${f.kind}, ${f.message}, ${f.email ?? null}, ${f.page ?? null},
      ${f.userId ?? null}, ${f.userAgent ?? null}
    )
  `;
}

export async function listFeedback(
  status: "new" | "resolved" | "all" = "all",
  limit = 60,
): Promise<FeedbackRow[]> {
  if (!dbEnabled || !sql) return [];
  await ensureSchema();
  const rows =
    status === "all"
      ? await sql`
          SELECT id, created_at, kind, message, email, page, user_id, status
          FROM feedback ORDER BY created_at DESC LIMIT ${limit}
        `
      : await sql`
          SELECT id, created_at, kind, message, email, page, user_id, status
          FROM feedback WHERE status = ${status}
          ORDER BY created_at DESC LIMIT ${limit}
        `;
  return rows as unknown as FeedbackRow[];
}

export async function setFeedbackStatus(
  id: string,
  status: "new" | "resolved",
): Promise<void> {
  if (!dbEnabled || !sql) return;
  await ensureSchema();
  await sql`
    UPDATE feedback
    SET status = ${status},
        resolved_at = ${status === "resolved" ? new Date().toISOString() : null}
    WHERE id = ${id}
  `;
}

export async function feedbackCounts(): Promise<{ new: number; total: number }> {
  if (!dbEnabled || !sql) return { new: 0, total: 0 };
  await ensureSchema();
  const rows = (await sql`
    SELECT status, count(*)::int AS n FROM feedback GROUP BY status
  `) as unknown as { status: string; n: number }[];
  let total = 0;
  let fresh = 0;
  for (const r of rows) {
    total += r.n;
    if (r.status === "new") fresh = r.n;
  }
  return { new: fresh, total };
}
