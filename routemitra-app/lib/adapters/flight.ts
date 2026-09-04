// Flight adapter. Source priority:
//   1. DUFFEL_API_KEY        -> real-time Duffel air search (sandbox or live)
//   2. TRAVELPAYOUTS_TOKEN   -> Aviasales cached fares (free, India-friendly)
//   3. sample data
// Any failure falls back down the chain, then to sample, so search never
// hard-fails.

import type { RouteOption, SearchParams } from "@/types/route";
import { getSampleOptions } from "@/lib/sample-data";
import { resolveAirport } from "@/lib/iata";
import { airlineName, airlineLogo } from "@/lib/airlines";

const DUFFEL_URL =
  "https://api.duffel.com/air/offer_requests?return_offers=true&supplier_timeout=10000";
const DUFFEL_VERSION = "v2";

const FX_TO_INR: Record<string, number> = {
  INR: 1,
  USD: 83,
  GBP: 105,
  EUR: 90,
  AED: 22.6,
  SGD: 62,
};

function sampleFlights(from: string, to: string): RouteOption[] {
  return getSampleOptions(from, to)
    .filter((o) => o.mode === "flight")
    .map((o) => ({ ...o, source: "sample", indicative: true }));
}

function isoDurationToMin(iso: string): number {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso || "");
  if (!m) return 0;
  return parseInt(m[1] || "0", 10) * 60 + parseInt(m[2] || "0", 10);
}
function hhmm(isoDateTime: string): string {
  return (isoDateTime || "").slice(11, 16) || "--:--";
}
function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------- Duffel ----
async function duffelFlights(
  origin: string,
  destination: string,
  date: string | null,
): Promise<RouteOption[]> {
  const res = await fetch(DUFFEL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
      "Duffel-Version": DUFFEL_VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        slices: [{ origin, destination, departure_date: date || tomorrow() }],
        passengers: [{ type: "adult" }],
        cabin_class: "economy",
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    console.error(`[flight] Duffel ${res.status}: ${await res.text()}`);
    return [];
  }
  const json = await res.json();
  const offers: unknown[] = json?.data?.offers ?? [];

  return offers
    .slice(0, 10)
    .map((raw): RouteOption => {
      const o = raw as Record<string, unknown>;
      const slice = (o.slices as Record<string, unknown>[])?.[0] ?? {};
      const segs = (slice.segments as Record<string, unknown>[]) ?? [];
      const first = segs[0] ?? {};
      const last = segs[segs.length - 1] ?? {};
      const owner = (o.owner as Record<string, unknown>) ?? {};
      const carrier = (first.marketing_carrier as Record<string, unknown>) ?? {};
      const flightNo = first.marketing_carrier_flight_number as string;
      const code = (carrier.iata_code as string) ?? "";
      const currency = String(o.total_currency ?? "INR");
      const rate = FX_TO_INR[currency];
      const amount = parseFloat(String(o.total_amount ?? "0"));
      return {
        mode: "flight",
        operator:
          code && flightNo
            ? `${airlineName(code)} ${code}-${flightNo}`
            : String(owner.name ?? "Flight"),
        price: rate ? Math.round(amount * rate) : Math.round(amount),
        duration_min: isoDurationToMin(String(slice.duration ?? "")),
        departure: hhmm(String(first.departing_at ?? "")),
        arrival: hhmm(String(last.arriving_at ?? "")),
        stops: Math.max(0, segs.length - 1),
        logo: airlineLogo(code),
        link: "https://www.google.com/travel/flights",
        indicative: currency !== "INR",
        source: "duffel",
      };
    })
    .filter((o) => o.price > 0);
}

// ---------------------------------------------------------- Travelpayouts ----
async function travelpayoutsFlights(
  origin: string,
  destination: string,
  date: string | null,
): Promise<RouteOption[]> {
  const token = process.env.TRAVELPAYOUTS_TOKEN!;
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  const url = new URL("https://api.travelpayouts.com/aviasales/v3/prices_for_dates");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  url.searchParams.set("currency", "inr");
  url.searchParams.set("one_way", "true");
  url.searchParams.set("sorting", "price");
  url.searchParams.set("limit", "12");
  url.searchParams.set("token", token);
  if (date) url.searchParams.set("departure_at", date);

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    console.error(`[flight] Travelpayouts ${res.status}: ${await res.text()}`);
    return [];
  }
  const json = (await res.json()) as {
    success?: boolean;
    data?: Record<string, unknown>[];
  };
  if (!json.success || !Array.isArray(json.data)) return [];

  return json.data
    .map((r): RouteOption => {
      const code = String(r.airline ?? "");
      const dep = String(r.departure_at ?? "");
      const durMin = Number(r.duration ?? r.duration_to ?? 0);
      const arrHH = addMinutes(hhmm(dep), durMin);
      const rawLink = String(r.link ?? "");
      const link = rawLink
        ? `https://www.aviasales.com${rawLink}${
            marker ? `${rawLink.includes("?") ? "&" : "?"}marker=${marker}` : ""
          }`
        : "https://www.aviasales.com";
      return {
        mode: "flight",
        operator: code
          ? `${airlineName(code)}${r.flight_number ? ` ${code}-${r.flight_number}` : ""}`
          : "Flight",
        price: Math.round(Number(r.price ?? 0)),
        duration_min: durMin,
        departure: hhmm(dep),
        arrival: arrHH,
        stops: Number(r.transfers ?? 0),
        logo: airlineLogo(code),
        link,
        indicative: true, // cached fare, not a live quote
        source: "travelpayouts",
      };
    })
    .filter((o) => o.price > 0);
}

function addMinutes(hhmmStr: string, mins: number): string {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmmStr);
  if (!m || !mins) return hhmmStr || "--:--";
  const total = (parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + mins) % 1440;
  const h = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// -------------------------------------------------------------- adapter ----
export async function searchFlight({
  from,
  to,
  date,
}: SearchParams): Promise<RouteOption[]> {
  const resOrigin = resolveAirport(from);
  const resDest = resolveAirport(to);
  const origin = resOrigin?.code ?? null;
  const destination = resDest?.code ?? null;
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  const hasDuffel = Boolean(process.env.DUFFEL_API_KEY);
  const hasTp = Boolean(process.env.TRAVELPAYOUTS_TOKEN);

  if (!origin || !destination || isBuild || (!hasDuffel && !hasTp)) {
    if (!isBuild) await new Promise((r) => setTimeout(r, 250));
    return sampleFlights(from, to);
  }

  // when either side is a "nearest airport" proxy (no airport of its own —
  // common for smaller districts), say so plainly rather than implying the
  // flight departs/arrives in the searched place itself
  const bits: string[] = [];
  if (resOrigin?.viaCity) bits.push(`${from} via ${resOrigin.viaCity}`);
  if (resDest?.viaCity) bits.push(`${to} via ${resDest.viaCity}`);
  const airportNote =
    bits.length > 0
      ? `Nearest airport used for ${bits.join(" and ")}.`
      : undefined;

  try {
    let out: RouteOption[] = [];
    if (hasDuffel) out = await duffelFlights(origin, destination, date);
    if (out.length === 0 && hasTp) {
      out = await travelpayoutsFlights(origin, destination, date);
    }
    if (airportNote) out = out.map((o) => ({ ...o, note: airportNote }));
    return out.length > 0 ? out : sampleFlights(from, to);
  } catch (err) {
    console.error("[flight] provider call failed:", err);
    return sampleFlights(from, to);
  }
}
