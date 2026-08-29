// Aggregator endpoint. Fires bus + train + flight adapters in parallel,
// merges them into the normalized shape, and returns a RouteResult.
//   GET /api/search?from=Pune&to=Bengaluru&date=2026-09-01
//
// Phase 3: check Redis cache first; only call adapters on a miss.

import { NextResponse } from "next/server";
import { searchBus } from "@/lib/adapters/bus";
import { searchTrain } from "@/lib/adapters/train";
import { searchFlight } from "@/lib/adapters/flight";
import { mergeResults } from "@/lib/normalize";
import {
  getCachedSearch,
  setCachedSearch,
  searchCacheKey,
  CACHE_TTL_SECONDS,
} from "@/lib/cache";
import type { RouteResult, SearchParams } from "@/types/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = (searchParams.get("from") || "").trim();
  const to = (searchParams.get("to") || "").trim();
  const date = searchParams.get("date");

  if (!from || !to) {
    return NextResponse.json(
      { error: "from aur to dono chahiye" },
      { status: 400 },
    );
  }

  const key = searchCacheKey(from, to, date);

  const cached = await getCachedSearch(key);
  if (cached) {
    console.log(`[search] cache HIT  ${key}`);
    return NextResponse.json(cached, {
      headers: { "x-cache": "HIT", "cache-control": "no-store" },
    });
  }
  console.log(`[search] cache MISS ${key}`);

  const params: SearchParams = { from, to, date };

  const settled = await Promise.allSettled([
    searchBus(params),
    searchTrain(params),
    searchFlight(params),
  ]);

  const options = mergeResults(settled);
  const body: RouteResult = { from, to, date, options };

  // Only cache non-empty results — an empty list is usually an unknown route
  // (or every provider failed), not something worth pinning for 10 min.
  if (options.length > 0) {
    await setCachedSearch(key, body);
  }

  return NextResponse.json(body, {
    headers: {
      "x-cache": "MISS",
      "cache-control": `no-store`,
      "x-cache-ttl": String(CACHE_TTL_SECONDS),
    },
  });
}
