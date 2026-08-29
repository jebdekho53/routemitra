// Phase 15 — IP rate limiting via Upstash. No-op (always allow) when Redis
// isn't configured, so local dev and no-key deploys keep working.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

type Window = `${number} s` | `${number} m` | `${number} h`;

const limiters = new Map<string, Ratelimit>();

function limiter(name: string, max: number, window: Window): Ratelimit | null {
  if (!redis) return null;
  const cacheKey = `${name}:${max}:${window}`;
  let l = limiters.get(cacheKey);
  if (!l) {
    l = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, window),
      prefix: `rl:${name}`,
      analytics: false,
    });
    limiters.set(cacheKey, l);
  }
  return l;
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "0.0.0.0";
}

export interface RateResult {
  ok: boolean;
  remaining: number;
  limit: number;
}

/** Returns {ok:true} immediately if rate limiting is disabled. */
export async function rateLimit(
  name: string,
  identifier: string,
  max: number,
  window: Window,
): Promise<RateResult> {
  const l = limiter(name, max, window);
  if (!l) return { ok: true, remaining: max, limit: max };
  const r = await l.limit(identifier);
  return { ok: r.success, remaining: r.remaining, limit: r.limit };
}
