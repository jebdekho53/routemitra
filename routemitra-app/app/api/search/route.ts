// Aggregator endpoint.
//   GET /api/search?from=Pune&to=Bengaluru&date=2026-09-01
// Delegates to lib/search (cache -> parallel adapters -> normalize).

import { NextResponse } from "next/server";
import { runSearch } from "@/lib/search";
import { CACHE_TTL_SECONDS } from "@/lib/cache";
import type { SearchParams } from "@/types/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = (searchParams.get("from") || "").trim();
  const to = (searchParams.get("to") || "").trim();
  const date = searchParams.get("date");
  const origin = (searchParams.get("origin") || "").trim() || null;
  const destination = (searchParams.get("destination") || "").trim() || null;

  if (!from || !to) {
    return NextResponse.json(
      { error: "from aur to dono chahiye" },
      { status: 400 },
    );
  }

  const params: SearchParams = { from, to, date, origin, destination };
  const { result, cache } = await runSearch(params);

  return NextResponse.json(result, {
    headers: {
      "x-cache": cache,
      "cache-control": "no-store",
      "x-cache-ttl": String(CACHE_TTL_SECONDS),
    },
  });
}
