// Shared aggregation pipeline: cache -> parallel adapters -> normalize.
// Used by the /api/search route and the static /routes/[slug] pages.

import { searchBus } from "@/lib/adapters/bus";
import { searchTrain } from "@/lib/adapters/train";
import { searchFlight } from "@/lib/adapters/flight";
import { mergeResults } from "@/lib/normalize";
import {
  getCachedSearch,
  setCachedSearch,
  searchCacheKey,
} from "@/lib/cache";
import { attachDoorToDoor } from "@/lib/door-to-door";
import { getSampleOptions } from "@/lib/sample-data";
import type {
  RouteResult,
  SearchParams,
  RouteOption,
  Mode,
} from "@/types/route";

export interface SearchOutcome {
  result: RouteResult;
  cache: "HIT" | "MISS";
}

// Sample-only result with normalized (tracked) links — for the always-static
// /routes/[slug] pages so they never call a live provider.
export function sampleSearch(from: string, to: string): RouteResult {
  const byMode = getSampleOptions(from, to).reduce<
    Record<Mode, RouteOption[]>
  >(
    (acc, o) => {
      acc[o.mode].push({ ...o, source: "sample", indicative: true });
      return acc;
    },
    { bus: [], train: [], flight: [] },
  );
  const settled: PromiseSettledResult<RouteOption[]>[] = (
    ["bus", "train", "flight"] as const
  ).map((m) => ({ status: "fulfilled", value: byMode[m] }));
  const options = mergeResults(settled, { from, to, date: null });
  return { from, to, date: null, options };
}

export async function runSearch(params: SearchParams): Promise<SearchOutcome> {
  const { from, to, date, origin, destination } = params;
  const key = searchCacheKey(from, to, date, origin, destination);

  const cached = await getCachedSearch(key);
  if (cached) {
    console.log(`[search] cache HIT  ${key}`);
    return { result: cached, cache: "HIT" };
  }
  console.log(`[search] cache MISS ${key}`);

  const settled = await Promise.allSettled([
    searchBus(params),
    searchTrain(params),
    searchFlight(params),
  ]);

  let options = mergeResults(settled, params);

  // Phase 11 — stitch local cab legs on when home/final addresses are given
  if (origin && destination) {
    options = await attachDoorToDoor(options, origin, destination);
  }

  const result: RouteResult = { from, to, date, options };

  // Only cache non-empty results — empty usually means unknown route.
  if (options.length > 0) {
    await setCachedSearch(key, result);
  }

  return { result, cache: "MISS" };
}
