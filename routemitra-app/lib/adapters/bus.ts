// Bus adapter. Phase 2: returns sample data. Phase 5: swap the body for a
// real bus-aggregator API call (RapidAPI interim, then RedBus GDS) and map
// the response into RouteOption[] — the signature stays the same.

import type { RouteOption, SearchParams } from "@/types/route";
import { getSampleOptions } from "@/lib/sample-data";

export async function searchBus({ from, to }: SearchParams): Promise<RouteOption[]> {
  // simulate provider network latency
  await new Promise((r) => setTimeout(r, 200));
  return getSampleOptions(from, to).filter((o) => o.mode === "bus");
}
