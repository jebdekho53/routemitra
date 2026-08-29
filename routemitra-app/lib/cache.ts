// Redis caching (Phase 3). Keyed by route + date, short TTL so fares stay
// fresh-ish. Uses Upstash Redis (serverless REST client).
//
// If UPSTASH_REDIS_REST_URL / _TOKEN are not set, every call becomes a no-op
// so local dev works without an Upstash account — you just don't get caching.

import { Redis } from "@upstash/redis";
import type { RouteResult } from "@/types/route";

export const CACHE_TTL_SECONDS = 600; // 10 min

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

let warnedNoRedis = false;
export function cacheEnabled(): boolean {
  if (!redis && !warnedNoRedis) {
    warnedNoRedis = true;
    console.warn(
      "[cache] UPSTASH_REDIS_REST_URL/_TOKEN not set — caching disabled",
    );
  }
  return redis !== null;
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
  if (!redis) return null;
  try {
    // Upstash auto-deserializes JSON values
    return (await redis.get<RouteResult>(key)) ?? null;
  } catch (err) {
    console.error("[cache] get failed:", err);
    return null;
  }
}

export async function setCachedSearch(
  key: string,
  value: RouteResult,
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: CACHE_TTL_SECONDS });
  } catch (err) {
    console.error("[cache] set failed:", err);
  }
}
