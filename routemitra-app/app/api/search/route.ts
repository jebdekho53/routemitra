// Aggregator endpoint.
//   GET /api/search?from=Pune&to=Bengaluru&date=2026-09-01
//     &origin=<addr>&destination=<addr>   (optional, door-to-door)
// Delegates to lib/search (cache -> parallel adapters -> normalize).

import { NextResponse } from "next/server";
import { runSearch } from "@/lib/search";
import { CACHE_TTL_SECONDS } from "@/lib/cache";
import { parse, searchQuerySchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { auth } from "@/auth";
import { dbEnabled } from "@/lib/db";
import { recordSavedSearch } from "@/lib/user-data";
import { logSearch } from "@/lib/metrics";
import type { SearchParams } from "@/types/route";

export async function GET(request: Request) {
  const rl = await rateLimit("search", clientIp(request), 60, "1 m");
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Please wait a moment before searching again." },
      { status: 429, headers: { "retry-after": "20" } },
    );
  }

  const { searchParams } = new URL(request.url);
  const { data, errors } = parse(searchQuerySchema, {
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
    date: searchParams.get("date"),
    origin: searchParams.get("origin"),
    destination: searchParams.get("destination"),
  });
  if (errors) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const params: SearchParams = {
    from: data.from,
    to: data.to,
    date: data.date ?? null,
    origin: data.origin ?? null,
    destination: data.destination ?? null,
  };
  const { result, cache } = await runSearch(params);

  // Phase 21 — aggregate search volume for the admin dashboard (fire & forget).
  logSearch(
    params.from,
    params.to,
    Boolean(params.origin && params.destination),
  ).catch(() => {});

  // Phase 13 — remember the search for logged-in users (fire and forget).
  if (dbEnabled) {
    auth()
      .then((session) => {
        if (session?.user?.id) {
          return recordSavedSearch(
            session.user.id,
            params.from,
            params.to,
            params.date,
          );
        }
      })
      .catch((err) => console.error("[search] saved-search failed:", err));
  }

  return NextResponse.json(result, {
    headers: {
      "x-cache": cache,
      "cache-control": "no-store",
      "x-cache-ttl": String(CACHE_TTL_SECONDS),
    },
  });
}
