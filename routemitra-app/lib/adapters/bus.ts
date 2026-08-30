// Bus adapter.
//   - BUS_PROVIDER_API_URL + BUS_PROVIDER_API_KEY set -> real HTTP call
//     (interim: a RapidAPI bus aggregator; later: RedBus Seat Seller / GDS)
//   - otherwise -> sample data (Phase 2 behaviour)
//
// Interim provider fares are marked `indicative: true` — the UI shows an
// "indicative" badge. Swap mapBusResponse() when the real provider is known;
// see docs/outreach/redbus.md for the partnership request in flight.

import type { RouteOption, SearchParams } from "@/types/route";
import { getSampleOptions } from "@/lib/sample-data";

function sampleBuses(from: string, to: string): RouteOption[] {
  return getSampleOptions(from, to)
    .filter((o) => o.mode === "bus")
    .map((o) => ({ ...o, source: "sample", indicative: true }));
}

// Best-effort mapper for a generic JSON bus-search response. Real provider
// shapes vary — adjust the field paths once the provider is chosen.
function mapBusResponse(json: unknown): RouteOption[] {
  const rows: Record<string, unknown>[] =
    (json as { data?: unknown[]; results?: unknown[]; buses?: unknown[] })?.data as Record<string, unknown>[] ??
    (json as { results?: unknown[] })?.results as Record<string, unknown>[] ??
    (json as { buses?: unknown[] })?.buses as Record<string, unknown>[] ??
    [];

  return rows
    .map((r) => {
      const price = Number(r.fare ?? r.price ?? r.amount ?? 0);
      const dep = String(r.departureTime ?? r.departure ?? r.dep_time ?? "");
      const arr = String(r.arrivalTime ?? r.arrival ?? r.arr_time ?? "");
      const durRaw = r.duration ?? r.travelDuration ?? r.duration_min;
      const duration_min =
        typeof durRaw === "number"
          ? durRaw
          : parseDuration(String(durRaw ?? ""));
      return {
        mode: "bus" as const,
        operator: String(r.operator ?? r.travels ?? r.name ?? "Bus operator"),
        price: Math.round(price),
        duration_min,
        departure: dep.slice(0, 5) || "--:--",
        arrival: arr.slice(0, 5) || "--:--",
        link: "https://www.redbus.in/", // normalize() -> route+date deep link
        indicative: true,
        source: "rapidapi",
      };
    })
    .filter((o) => o.price > 0)
    .slice(0, 10);
}

function parseDuration(s: string): number {
  // handles "10h 30m", "10:30", "630"
  const hm = /(\d+)\s*h(?:\s*(\d+)\s*m)?/i.exec(s);
  if (hm) return parseInt(hm[1], 10) * 60 + parseInt(hm[2] || "0", 10);
  const colon = /^(\d+):(\d+)$/.exec(s.trim());
  if (colon) return parseInt(colon[1], 10) * 60 + parseInt(colon[2], 10);
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

export async function searchBus({
  from,
  to,
}: SearchParams): Promise<RouteOption[]> {
  const url = process.env.BUS_PROVIDER_API_URL;
  const key = process.env.BUS_PROVIDER_API_KEY;
  const host = process.env.BUS_PROVIDER_API_HOST;

  if (!url || !key) {
    await new Promise((r) => setTimeout(r, 200));
    return sampleBuses(from, to);
  }

  try {
    const target = url
      .replace("{from}", encodeURIComponent(from))
      .replace("{to}", encodeURIComponent(to));
    const res = await fetch(target, {
      headers: {
        "x-rapidapi-key": key,
        ...(host ? { "x-rapidapi-host": host } : {}),
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      console.error(`[bus] provider ${res.status}: ${await res.text()}`);
      return sampleBuses(from, to);
    }
    const mapped = mapBusResponse(await res.json());
    return mapped.length > 0 ? mapped : sampleBuses(from, to);
  } catch (err) {
    console.error("[bus] provider call failed:", err);
    return sampleBuses(from, to);
  }
}
