// Phase 13 — per-user data: recent searches, route watches (price alerts),
// favourite routes. All require the DB; callers should already be authed.

import { sql, ensureSchema } from "@/lib/db";

function db() {
  if (!sql) throw new Error("DATABASE_URL not set");
  return sql;
}

const norm = (s: string) => s.trim();

export interface SavedSearch {
  id: string;
  from_city: string;
  to_city: string;
  date: string | null;
  created_at: string;
}
export interface RouteWatch {
  id: string;
  from_city: string;
  to_city: string;
  last_price: number | null;
  active: boolean;
  last_checked_at: string | null;
  created_at: string;
}
export interface Favourite {
  id: string;
  from_city: string;
  to_city: string;
  created_at: string;
}

export async function recordSavedSearch(
  userId: string,
  from: string,
  to: string,
  date: string | null,
): Promise<void> {
  const q = db();
  await ensureSchema();
  await q`
    INSERT INTO saved_searches (user_id, from_city, to_city, date)
    VALUES (${userId}, ${norm(from)}, ${norm(to)}, ${date})
  `;
  // keep only the 10 most recent per user
  await q`
    DELETE FROM saved_searches
    WHERE user_id = ${userId}
      AND id NOT IN (
        SELECT id FROM saved_searches WHERE user_id = ${userId}
        ORDER BY created_at DESC LIMIT 10
      )
  `;
}

export async function listSavedSearches(userId: string): Promise<SavedSearch[]> {
  const q = db();
  await ensureSchema();
  return (await q`
    SELECT id, from_city, to_city, date, created_at
    FROM saved_searches WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT 10
  `) as unknown as SavedSearch[];
}

export async function listWatches(userId: string): Promise<RouteWatch[]> {
  const q = db();
  await ensureSchema();
  return (await q`
    SELECT id, from_city, to_city, last_price, active, last_checked_at, created_at
    FROM route_watches WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `) as unknown as RouteWatch[];
}

export async function addWatch(
  userId: string,
  from: string,
  to: string,
  seedPrice: number | null,
): Promise<void> {
  const q = db();
  await ensureSchema();
  await q`
    INSERT INTO route_watches (user_id, from_city, to_city, last_price, last_checked_at)
    VALUES (${userId}, ${norm(from)}, ${norm(to)}, ${seedPrice}, now())
    ON CONFLICT (user_id, from_city, to_city)
    DO UPDATE SET active = true
  `;
}

export async function removeWatch(userId: string, id: string): Promise<void> {
  await db()`DELETE FROM route_watches WHERE user_id = ${userId} AND id = ${id}`;
}

export async function listFavourites(userId: string): Promise<Favourite[]> {
  const q = db();
  await ensureSchema();
  return (await q`
    SELECT id, from_city, to_city, created_at
    FROM favourite_routes WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `) as unknown as Favourite[];
}

export async function addFavourite(
  userId: string,
  from: string,
  to: string,
): Promise<void> {
  const q = db();
  await ensureSchema();
  await q`
    INSERT INTO favourite_routes (user_id, from_city, to_city)
    VALUES (${userId}, ${norm(from)}, ${norm(to)})
    ON CONFLICT (user_id, from_city, to_city) DO NOTHING
  `;
}

export async function removeFavourite(userId: string, id: string): Promise<void> {
  await db()`DELETE FROM favourite_routes WHERE user_id = ${userId} AND id = ${id}`;
}
