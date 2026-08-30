// Search caching. Keyed by route + date, short TTL so fares stay fresh-ish.
//
// Two tiers:
//   1. Upstash Redis  — when UPSTASH_REDIS_REST_URL/_TOKEN are set (shared
//      across instances, survives restarts).
//   2. In-process Map — always on. Cheap win: repeat searches (and geocode
//      lookups, which reuse this store) are instant within a running server.
//      Doesn't persist across serverless cold starts, and that's fine.

import { Redis } from "@upstash/redis";
import type { RouteResult } from "@/types/route";

export const CACHE_TTL_SECONDS = 600; // 10 min

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

// ---- in-process fallback ----
type Entry = { value: unknown; expires: number };
const g = globalThis as unknown as { __rmCache?: Map<string, Entry> };
const mem = (g.__rmCache ??= new Map<string, Entry>());
const MEM_MAX = 500;

function memGet<T>(key: string): T | null {
  const e = mem.get(key);
  if (!e) return null;
  if (e.expires < Date.now()) {
    mem.delete(key);
    return null;
  }
  return e.value as T;
}
function memSet(key: string, value: unknown, ttl = CACHE_TTL_SECONDS): void {
  if (mem.size >= MEM_MAX) {
    // drop the oldest ~10%
    let n = Math.ceil(MEM_MAX * 0.1);
    for (const k of mem.keys()) {
      mem.delete(k);
      if (--n <= 0) break;
    }
  }
  mem.set(key, { value, expires: Date.now() + ttl * 1000 });
}

export function cacheEnabled(): boolean {
  return true; // in-process cache is always available
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "-");
}

export function searchCacheKey(
  from: string,
  to: string,
  date: string | null,
  origin?: string | null,
  destination?: string | null,
) {
  const base = `search:${norm(from)}:${norm(to)}:${date ?? "any"}`;
  if (!origin && !destination) return base;
  return `${base}:d2d:${norm(origin ?? "")}>${norm(destination ?? "")}`;
}

export async function getCachedSearch(
  key: string,
): Promise<RouteResult | null> {
  const local = memGet<RouteResult>(key);
  if (local) return local;
  if (!redis) return null;
  try {
    const v = (await redis.get<RouteResult>(key)) ?? null;
    if (v) memSet(key, v);
    return v;
  } catch (err) {
    console.error("[cache] get failed:", err);
    return null;
  }
}

export async function setCachedSearch(
  key: string,
  value: RouteResult,
): Promise<void> {
  memSet(key, value);
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: CACHE_TTL_SECONDS });
  } catch (err) {
    console.error("[cache] set failed:", err);
  }
}
