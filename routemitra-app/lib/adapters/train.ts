// Train adapter. Source priority:
//   1. RAPIDAPI_IRCTC_KEY -> RapidAPI "irctc1" trainBetweenStations (India).
//      Free tier is tiny (~20 calls/mo) so results are cached hard upstream
//      and fares are estimated (this endpoint has no fare). Marked indicative.
//   2. TRAIN_ERAIL -> erail.in unofficial "trains between stations" scrape.
//      Free, no quota, real timetable; fares estimated. Grey-area — see erail.ts.
//   3. TRAIN_PROVIDER_API_URL + _KEY -> generic HTTP provider (later: a PSP).
//   4. sample data.

import type { RouteOption, SearchParams } from "@/types/route";
import { getSampleOptions } from "@/lib/sample-data";
import { resolveStation } from "@/lib/stations";
import { erailTrains } from "@/lib/adapters/erail";

function sampleTrains(from: string, to: string): RouteOption[] {
  return getSampleOptions(from, to)
    .filter((o) => o.mode === "train")
    .map((o) => ({ ...o, source: "sample", indicative: true }));
}

function parseDuration(s: string): number {
  const hm = /(\d+)\s*h(?:\s*(\d+)\s*m)?/i.exec(s);
  if (hm) return parseInt(hm[1], 10) * 60 + parseInt(hm[2] || "0", 10);
  const dot = /^(\d+)\.(\d+)$/.exec(s.trim()); // "15.50" -> 15h 50m
  if (dot) return parseInt(dot[1], 10) * 60 + parseInt(dot[2], 10);
  const colon = /^(\d+):(\d+)$/.exec(s.trim());
  if (colon) return parseInt(colon[1], 10) * 60 + parseInt(colon[2], 10);
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

const hhmm = (s: string) => (s || "").replace(".", ":").slice(0, 5) || "--:--";

// This endpoint returns no fare. Estimate from duration + train class:
// premium (Rajdhani/Shatabdi/Vande Bharat/Tejas/Duronto) vs regular.
function estimateFare(durationMin: number, trainType: string): number {
  const premium = /RAJ|SHTB|VB|VNDB|TEJ|DNRT|GR|JS|SF/i.test(trainType || "");
  const perMin = premium ? 2.8 : 1.1;
  return Math.min(4200, Math.max(120, Math.round(durationMin * perMin)));
}

// ------------------------------------------------------- RapidAPI irctc1 ----
async function irctcTrains(
  fromCode: string,
  toCode: string,
  date: string | null,
): Promise<RouteOption[]> {
  const host = process.env.RAPIDAPI_IRCTC_HOST || "irctc1.p.rapidapi.com";
  const url = new URL(`https://${host}/api/v3/trainBetweenStations`);
  url.searchParams.set("fromStationCode", fromCode);
  url.searchParams.set("toStationCode", toCode);
  url.searchParams.set(
    "dateOfJourney",
    date || new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10),
  );

  const res = await fetch(url, {
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_IRCTC_KEY!,
      "x-rapidapi-host": host,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    console.error(`[train] irctc1 ${res.status}: ${await res.text()}`);
    return [];
  }
  const json = (await res.json()) as { data?: Record<string, unknown>[] };
  const rows = Array.isArray(json.data) ? json.data : [];

  return rows
    .slice(0, 12)
    .map((r): RouteOption => {
      const num = String(r.train_number ?? r.train_no ?? "");
      const name = String(r.train_name ?? "Train");
      const dep = hhmm(String(r.from_std ?? r.from_sta ?? ""));
      const arr = hhmm(String(r.to_sta ?? r.to_std ?? ""));
      const dur = parseDuration(String(r.duration ?? ""));
      const type = String(r.train_type ?? "");
      return {
        mode: "train",
        operator: num ? `${name} (${num})` : name,
        price: estimateFare(dur, type),
        duration_min: dur,
        departure: dep,
        arrival: arr,
        stops: 0,
        link: "https://www.confirmtkt.com/", // normalize() -> route+date deep link
        indicative: true,
        source: "irctc",
      };
    })
    .filter((o) => o.duration_min > 0);
}

// ------------------------------------------------------- generic provider ----
async function genericProviderTrains(
  from: string,
  to: string,
): Promise<RouteOption[]> {
  const url = process.env.TRAIN_PROVIDER_API_URL!;
  const key = process.env.TRAIN_PROVIDER_API_KEY!;
  const host = process.env.TRAIN_PROVIDER_API_HOST;
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
    return [];
  }
  const json = (await res.json()) as {
    data?: Record<string, unknown>[];
    trains?: Record<string, unknown>[];
    results?: Record<string, unknown>[];
  };
  const rows = json.data ?? json.trains ?? json.results ?? [];
  return rows
    .slice(0, 12)
    .map((r): RouteOption => {
      const num = r.train_number ?? r.trainNo ?? r.number;
      const name = r.train_name ?? r.trainName ?? r.name ?? "Train";
      const fareRaw = r.fare ?? r.price ?? 0;
      const durRaw = r.duration ?? r.travel_time ?? r.duration_min;
      return {
        mode: "train",
        operator: num ? `${name} (${num})` : String(name),
        price: Math.round(Number(fareRaw) || 0),
        duration_min:
          typeof durRaw === "number" ? durRaw : parseDuration(String(durRaw ?? "")),
        departure: hhmm(String(r.from_std ?? r.departure ?? r.dep_time ?? "")),
        arrival: hhmm(String(r.to_sta ?? r.arrival ?? r.arr_time ?? "")),
        link: "https://www.confirmtkt.com/",
        indicative: true,
        source: "rapidapi",
      };
    })
    .filter((o) => o.price > 0);
}

// When either end resolved to a "nearest station" proxy rather than the
// searched place's own station, the train/IRCTC feed only knows the two
// station codes — it can return a real, running train between them that
// still doesn't actually serve one (or both) of the places the user typed.
// Surface that plainly rather than presenting a single fallback result as a
// confirmed direct option (see: Ajmer -> Bokaro returning an Ajmer-bound
// "AII SRC SPL" special that ConfirmTkt itself lists as having no direct
// Ajmer-Bokaro train).
function stationCaveat(
  from: string,
  to: string,
  resFrom: ReturnType<typeof resolveStation>,
  resTo: ReturnType<typeof resolveStation>,
): string | undefined {
  const bits: string[] = [];
  if (resFrom?.viaCity) bits.push(`${from} via ${resFrom.viaCity}`);
  if (resTo?.viaCity) bits.push(`${to} via ${resTo.viaCity}`);
  if (bits.length === 0) return undefined;
  return `Nearest station used for ${bits.join(" and ")} — this train may not serve the exact place directly. Confirm the stop before booking.`;
}

// -------------------------------------------------------------- adapter ----
export async function searchTrain({
  from,
  to,
  date,
}: SearchParams): Promise<RouteOption[]> {
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  const hasIrctc = Boolean(process.env.RAPIDAPI_IRCTC_KEY);
  const hasErail = Boolean(process.env.TRAIN_ERAIL);
  const hasGeneric = Boolean(
    process.env.TRAIN_PROVIDER_API_URL && process.env.TRAIN_PROVIDER_API_KEY,
  );

  if (isBuild || (!hasIrctc && !hasErail && !hasGeneric)) {
    if (!isBuild) await new Promise((r) => setTimeout(r, 250));
    return sampleTrains(from, to);
  }

  try {
    let out: RouteOption[] = [];
    const resFrom = resolveStation(from);
    const resTo = resolveStation(to);
    const caveat = stationCaveat(from, to, resFrom, resTo);

    if (hasIrctc) {
      const fc = resFrom?.code ?? null;
      const tc = resTo?.code ?? null;
      if (fc && tc) {
        out = await irctcTrains(fc, tc, date);
        if (caveat) out = out.map((o) => ({ ...o, note: caveat }));
      }
    }
    if (out.length === 0 && hasErail) {
      const fc = resFrom?.code ?? null;
      const tc = resTo?.code ?? null;
      if (fc && tc) {
        out = await erailTrains(fc, tc, date);
        if (caveat) out = out.map((o) => ({ ...o, note: caveat }));
        if (out.length === 0) {
          console.warn(
            `[train] erail yielded nothing for ${from}->${to} (${fc}-${tc}); falling back to sample`,
          );
        }
      } else {
        console.warn(
          `[train] erail skipped for ${from}->${to}: no station code (${fc ?? "?"}-${tc ?? "?"})`,
        );
      }
    }
    if (out.length === 0 && hasGeneric) {
      out = await genericProviderTrains(from, to);
    }
    return out.length > 0 ? out : sampleTrains(from, to);
  } catch (err) {
    console.error("[train] provider call failed:", err);
    return sampleTrains(from, to);
  }
}
