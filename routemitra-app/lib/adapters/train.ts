// Train adapter.
//   - TRAIN_PROVIDER_API_URL + TRAIN_PROVIDER_API_KEY set -> real HTTP call
//     (interim: a RapidAPI IRCTC wrapper; later: ConfirmTkt / RailYatri PSP)
//   - otherwise -> sample data (Phase 2 behaviour)
//
// Interim fares are marked `indicative: true`. See docs/outreach/ for the
// ConfirmTkt + RailYatri partnership requests in flight.

import type { RouteOption, SearchParams } from "@/types/route";
import { getSampleOptions } from "@/lib/sample-data";

function sampleTrains(from: string, to: string): RouteOption[] {
  return getSampleOptions(from, to)
    .filter((o) => o.mode === "train")
    .map((o) => ({ ...o, source: "sample", indicative: true }));
}

function parseDuration(s: string): number {
  const hm = /(\d+)\s*h(?:\s*(\d+)\s*m)?/i.exec(s);
  if (hm) return parseInt(hm[1], 10) * 60 + parseInt(hm[2] || "0", 10);
  const colon = /^(\d+):(\d+)$/.exec(s.trim());
  if (colon) return parseInt(colon[1], 10) * 60 + parseInt(colon[2], 10);
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

function mapTrainResponse(json: unknown): RouteOption[] {
  const rows: Record<string, unknown>[] =
    (json as { data?: unknown[] })?.data as Record<string, unknown>[] ??
    (json as { trains?: unknown[] })?.trains as Record<string, unknown>[] ??
    (json as { results?: unknown[] })?.results as Record<string, unknown>[] ??
    [];

  return rows
    .map((r) => {
      const num = r.train_number ?? r.trainNo ?? r.number;
      const name = r.train_name ?? r.trainName ?? r.name ?? "Train";
      const fareRaw =
        r.fare ?? r.price ?? (r.classes as Record<string, unknown>)?.SL ?? 0;
      const dep = String(r.from_std ?? r.departure ?? r.dep_time ?? "");
      const arr = String(r.to_sta ?? r.arrival ?? r.arr_time ?? "");
      const durRaw = r.duration ?? r.travel_time ?? r.duration_min;
      return {
        mode: "train" as const,
        operator: num ? `${name} (${num})` : String(name),
        price: Math.round(Number(fareRaw) || 0),
        duration_min:
          typeof durRaw === "number"
            ? durRaw
            : parseDuration(String(durRaw ?? "")),
        departure: dep.slice(0, 5) || "--:--",
        arrival: arr.slice(0, 5) || "--:--",
        link: "https://www.confirmtkt.com/", // normalize() -> route+date deep link
        indicative: true,
        source: "rapidapi",
      };
    })
    .filter((o) => o.price > 0)
    .slice(0, 10);
}

export async function searchTrain({
  from,
  to,
}: SearchParams): Promise<RouteOption[]> {
  const url = process.env.TRAIN_PROVIDER_API_URL;
  const key = process.env.TRAIN_PROVIDER_API_KEY;
  const host = process.env.TRAIN_PROVIDER_API_HOST;

  if (!url || !key) {
    await new Promise((r) => setTimeout(r, 250));
    return sampleTrains(from, to);
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
      console.error(`[train] provider ${res.status}: ${await res.text()}`);
      return sampleTrains(from, to);
    }
    const mapped = mapTrainResponse(await res.json());
    return mapped.length > 0 ? mapped : sampleTrains(from, to);
  } catch (err) {
    console.error("[train] provider call failed:", err);
    return sampleTrains(from, to);
  }
}
