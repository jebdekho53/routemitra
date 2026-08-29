// Flight adapter. Phase 2: returns sample data. Phase 4: swap the body for a
// real Duffel flight-search call and map offers into RouteOption[].

import type { RouteOption, SearchParams } from "@/types/route";
import { getSampleOptions } from "@/lib/sample-data";

export async function searchFlight({ from, to }: SearchParams): Promise<RouteOption[]> {
  await new Promise((r) => setTimeout(r, 300));
  return getSampleOptions(from, to).filter((o) => o.mode === "flight");
}
