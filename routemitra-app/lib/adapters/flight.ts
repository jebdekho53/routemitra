// Flight adapter.
//   - DUFFEL_API_KEY set  -> real Duffel air search (sandbox or live)
//   - otherwise           -> sample data (Phase 2 behaviour)
// Any failure falls back to sample data so search never hard-fails.

import type { RouteOption, SearchParams } from "@/types/route";
import { getSampleOptions } from "@/lib/sample-data";
import { toIata } from "@/lib/iata";
import { bookingLink } from "@/lib/links";

const DUFFEL_URL = "https://api.duffel.com/air/offer_requests?return_offers=true";
const DUFFEL_VERSION = "v2";

function sampleFlights(from: string, to: string): RouteOption[] {
  return getSampleOptions(from, to)
    .filter((o) => o.mode === "flight")
    .map((o) => ({ ...o, source: "sample" }));
}

function isoDurationToMin(iso: string): number {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso || "");
  if (!m) return 0;
  return (parseInt(m[1] || "0", 10) * 60) + parseInt(m[2] || "0", 10);
}

function hhmm(isoDateTime: string): string {
  // Duffel returns airport-local time like "2026-09-01T14:20:00"
  return (isoDateTime || "").slice(11, 16) || "--:--";
}

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function searchFlight({
  from,
  to,
  date,
}: SearchParams): Promise<RouteOption[]> {
  const key = process.env.DUFFEL_API_KEY;
  const origin = toIata(from);
  const destination = toIata(to);

  if (!key || !origin || !destination) {
    await new Promise((r) => setTimeout(r, 300)); // keep loading state visible
    return sampleFlights(from, to);
  }

  try {
    const res = await fetch(DUFFEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Duffel-Version": DUFFEL_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          slices: [
            { origin, destination, departure_date: date || tomorrow() },
          ],
          passengers: [{ type: "adult" }],
          cabin_class: "economy",
        },
      }),
      // don't let a slow provider hang the whole aggregator forever
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      console.error(`[flight] Duffel ${res.status}: ${await res.text()}`);
      return sampleFlights(from, to);
    }

    const json = await res.json();
    const offers: unknown[] = json?.data?.offers ?? [];

    const mapped: RouteOption[] = offers
      .slice(0, 8)
      .map((raw) => {
        const o = raw as Record<string, unknown>;
        const slice = (o.slices as Record<string, unknown>[])?.[0] ?? {};
        const segs = (slice.segments as Record<string, unknown>[]) ?? [];
        const first = segs[0] ?? {};
        const last = segs[segs.length - 1] ?? {};
        const owner = (o.owner as Record<string, unknown>) ?? {};
        const carrier =
          (first.marketing_carrier as Record<string, unknown>) ?? {};
        const flightNo = first.marketing_carrier_flight_number as string;
        const code = carrier.iata_code as string;

        return {
          mode: "flight" as const,
          operator:
            code && flightNo
              ? `${owner.name ?? code} ${code}-${flightNo}`
              : String(owner.name ?? "Flight"),
          price: Math.round(parseFloat(String(o.total_amount ?? "0"))),
          duration_min: isoDurationToMin(String(slice.duration ?? "")),
          departure: hhmm(String(first.departing_at ?? "")),
          arrival: hhmm(String(last.arriving_at ?? "")),
          link: bookingLink("flight", from, to, "https://www.google.com/travel/flights"),
          source: "duffel",
        };
      })
      .filter((o) => o.price > 0);

    return mapped.length > 0 ? mapped : sampleFlights(from, to);
  } catch (err) {
    console.error("[flight] Duffel call failed:", err);
    return sampleFlights(from, to);
  }
}
