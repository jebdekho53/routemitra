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

// ---- Traffic page ----------------------------------------------------------

export interface TrafficStats {
  windowDays: number;
  searchTotal: number;
  searchWindow: number;
  doorToDoor: number;
  clickTotal: number;
  clickWindow: number;
  daily: { day: string; searches: number; clicks: number }[];
  topRoutes: { from_city: string; to_city: string; searches: number }[];
  byMode: { mode: string; clicks: number }[];
  recentClicks: {
    mode: string;
    operator: string;
    price: number | null;
    from_city: string;
    to_city: string;
    indicative: boolean;
    created_at: string;
  }[];
}

export async function trafficStats(
  windowDays = 7,
): Promise<TrafficStats | null> {
  if (!dbEnabled || !sql) return null;
  await ensureSchema();
  const [
    searchTotal,
    searchWindow,
    d2d,
    clickTotal,
    clickWindow,
    daily,
    topRoutes,
    byMode,
    recentClicks,
  ] = await Promise.all([
    sql`SELECT count(*)::int AS n FROM searches`,
    sql`SELECT count(*)::int AS n FROM searches WHERE created_at > now() - make_interval(days => ${windowDays})`,
    sql`SELECT count(*)::int AS n FROM searches WHERE door_to_door AND created_at > now() - make_interval(days => ${windowDays})`,
    sql`SELECT count(*)::int AS n FROM clicks`,
    sql`SELECT count(*)::int AS n FROM clicks WHERE created_at > now() - make_interval(days => ${windowDays})`,
    sql`
      SELECT to_char(g::date, 'MM-DD') AS day,
             (SELECT count(*)::int FROM searches WHERE created_at::date = g::date) AS searches,
             (SELECT count(*)::int FROM clicks   WHERE created_at::date = g::date) AS clicks
      FROM generate_series(
        current_date - make_interval(days => ${windowDays - 1}),
        current_date, interval '1 day'
      ) AS g
      ORDER BY g
    `,
    sql`
      SELECT from_city, to_city, count(*)::int AS searches
      FROM searches
      WHERE created_at > now() - make_interval(days => ${windowDays})
      GROUP BY from_city, to_city
      ORDER BY searches DESC LIMIT 40
    `,
    sql`SELECT mode, count(*)::int AS clicks FROM clicks GROUP BY mode ORDER BY clicks DESC`,
    sql`
      SELECT mode, operator, price, from_city, to_city, indicative, created_at
      FROM clicks ORDER BY created_at DESC LIMIT 30
    `,
  ]);
  return {
    windowDays,
    searchTotal: n(searchTotal),
    searchWindow: n(searchWindow),
    doorToDoor: n(d2d),
    clickTotal: n(clickTotal),
    clickWindow: n(clickWindow),
    daily: daily as unknown as TrafficStats["daily"],
    topRoutes: topRoutes as unknown as TrafficStats["topRoutes"],
    byMode: byMode as unknown as TrafficStats["byMode"],
    recentClicks: recentClicks as unknown as TrafficStats["recentClicks"],
  };
}

// ---- Users page ----------------------------------------------------------

export interface UserStats {
  total: number;
  verified: number;
  oauth: number;
  recent: number;
  savedSearches: number;
  watchesActive: number;
  watchesTotal: number;
  recentUsers: {
    id: string;
    email: string;
    name: string | null;
    oauth_provider: string | null;
    email_verified_at: string | null;
    created_at: string;
  }[];
}

export async function userStats(windowDays = 7): Promise<UserStats | null> {
  if (!dbEnabled || !sql) return null;
  await ensureSchema();
  const [total, verified, oauth, recent, saved, wActive, wTotal, list] =
    await Promise.all([
      sql`SELECT count(*)::int AS n FROM users`,
      sql`SELECT count(*)::int AS n FROM users WHERE email_verified_at IS NOT NULL`,
      sql`SELECT count(*)::int AS n FROM users WHERE oauth_provider IS NOT NULL`,
      sql`SELECT count(*)::int AS n FROM users WHERE created_at > now() - make_interval(days => ${windowDays})`,
      sql`SELECT count(*)::int AS n FROM saved_searches`,
      sql`SELECT count(*)::int AS n FROM route_watches WHERE active`,
      sql`SELECT count(*)::int AS n FROM route_watches`,
      sql`
        SELECT id, email, name, oauth_provider, email_verified_at, created_at
        FROM users ORDER BY created_at DESC LIMIT 40
      `,
    ]);
  return {
    total: n(total),
    verified: n(verified),
    oauth: n(oauth),
    recent: n(recent),
    savedSearches: n(saved),
    watchesActive: n(wActive),
    watchesTotal: n(wTotal),
    recentUsers: list as unknown as UserStats["recentUsers"],
  };
}

// ---- System page -------------------------------------------------------

export async function recentErrors(limit = 30): Promise<
  { message: string; digest: string | null; path: string | null; created_at: string }[]
> {
  if (!dbEnabled || !sql) return [];
  await ensureSchema();
  return (await sql`
    SELECT message, digest, path, created_at FROM errors
    ORDER BY created_at DESC LIMIT ${limit}
  `) as unknown as {
    message: string;
    digest: string | null;
    path: string | null;
    created_at: string;
  }[];
}
