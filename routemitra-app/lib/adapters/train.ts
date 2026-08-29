// Train adapter. Phase 2: returns sample data. Phase 6: swap the body for a
// real train API (ConfirmTkt / RailYatri PSP, RapidAPI IRCTC wrapper interim)
// and map the response into RouteOption[].

import type { RouteOption, SearchParams } from "@/types/route";
import { getSampleOptions } from "@/lib/sample-data";

export async function searchTrain({ from, to }: SearchParams): Promise<RouteOption[]> {
  await new Promise((r) => setTimeout(r, 250));
  return getSampleOptions(from, to).filter((o) => o.mode === "train");
}
