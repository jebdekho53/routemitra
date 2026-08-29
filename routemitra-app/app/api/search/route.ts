// Aggregator endpoint. Fires bus + train + flight adapters in parallel,
// merges them into the normalized shape, and returns a RouteResult.
//   GET /api/search?from=Pune&to=Bengaluru&date=2026-09-01

import { NextResponse } from "next/server";
import { searchBus } from "@/lib/adapters/bus";
import { searchTrain } from "@/lib/adapters/train";
import { searchFlight } from "@/lib/adapters/flight";
import { mergeResults } from "@/lib/normalize";
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

  const params: SearchParams = { from, to, date };

  const settled = await Promise.allSettled([
    searchBus(params),
    searchTrain(params),
    searchFlight(params),
  ]);

  const options = mergeResults(settled);

  const body: RouteResult = { from, to, date, options };
  return NextResponse.json(body);
}
