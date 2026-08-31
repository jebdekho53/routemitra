// Phase 21 — lightweight product metrics for the admin dashboard.
// Everything here is aggregate and PII-free. No-op without a database.

import { sql, ensureSchema, dbEnabled } from "@/lib/db";
import { feedbackCounts } from "@/lib/feedback";

/** Fire-and-forget from the search API. Never throws. */
export async function logSearch(
  from: string,
  to: string,
  doorToDoor: boolean,
): Promise<void> {
  if (!dbEnabled || !sql) return;
  try {
    await ensureSchema();
    await sql`
      INSERT INTO searches (from_city, to_city, door_to_door)
      VALUES (${from}, ${to}, ${doorToDoor})
    `;
  } catch (err) {
    console.error("[metrics] logSearch failed:", err);
  }
}

export interface AdminMetrics {
  windowDays: number;
  users: { total: number; recent: number };
  searches: { total: number; window: number; doorToDoor: number };
  clicks: { total: number; window: number };
  watches: { active: number };
  feedback: { new: number; total: number };
  topRoutes: { from_city: string; to_city: string; searches: number }[];
  byMode: { mode: string; clicks: number }[];
  daily: { day: string; searches: number; clicks: number }[];
}

const n = (rows: unknown): number => {
  const r = rows as { n?: number }[];
  return r[0]?.n ?? 0;
};

export async function adminMetrics(
  windowDays = 7,
): Promise<AdminMetrics | null> {
  if (!dbEnabled || !sql) return null;
  await ensureSchema();

  const [
    usersTotal,
    usersRecent,
    searchTotal,
    searchWindow,
    searchD2D,
    clickTotal,
    clickWindow,
    watchActive,
    topRoutes,
    byMode,
    daily,
    fb,
  ] = await Promise.all([
    sql`SELECT count(*)::int AS n FROM users`,
    sql`SELECT count(*)::int AS n FROM users WHERE created_at > now() - make_interval(days => ${windowDays})`,
    sql`SELECT count(*)::int AS n FROM searches`,
    sql`SELECT count(*)::int AS n FROM searches WHERE created_at > now() - make_interval(days => ${windowDays})`,
    sql`SELECT count(*)::int AS n FROM searches WHERE door_to_door AND created_at > now() - make_interval(days => ${windowDays})`,
    sql`SELECT count(*)::int AS n FROM clicks`,
    sql`SELECT count(*)::int AS n FROM clicks WHERE created_at > now() - make_interval(days => ${windowDays})`,
    sql`SELECT count(*)::int AS n FROM route_watches WHERE active`,
    sql`
      SELECT from_city, to_city, count(*)::int AS searches
      FROM searches
      WHERE created_at > now() - make_interval(days => ${windowDays})
      GROUP BY from_city, to_city
      ORDER BY searches DESC
      LIMIT 12
    `,
    sql`SELECT mode, count(*)::int AS clicks FROM clicks GROUP BY mode ORDER BY clicks DESC`,
    sql`
      SELECT to_char(g::date, 'MM-DD') AS day,
             (SELECT count(*)::int FROM searches WHERE created_at::date = g::date) AS searches,
             (SELECT count(*)::int FROM clicks   WHERE created_at::date = g::date) AS clicks
      FROM generate_series(
        current_date - make_interval(days => ${windowDays - 1}),
        current_date,
        interval '1 day'
      ) AS g
      ORDER BY g
    `,
    feedbackCounts(),
  ]);

  return {
    windowDays,
    users: { total: n(usersTotal), recent: n(usersRecent) },
    searches: {
      total: n(searchTotal),
      window: n(searchWindow),
      doorToDoor: n(searchD2D),
    },
    clicks: { total: n(clickTotal), window: n(clickWindow) },
    watches: { active: n(watchActive) },
    feedback: fb as { new: number; total: number },
    topRoutes: topRoutes as unknown as AdminMetrics["topRoutes"],
    byMode: byMode as unknown as AdminMetrics["byMode"],
    daily: daily as unknown as AdminMetrics["daily"],
  };
}
