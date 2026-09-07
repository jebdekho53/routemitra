// TripJack bus adapter — B2B GDS, live inventory (6,000+ operators visible in
// the portal). Enabled by TRIPJACK_API_KEY; base URL by TRIPJACK_API_BASE
// (sandbox: https://apitest.tripjack.com, prod: https://tripjack.com).
//
// STATUS: structure only. The account (21204437) is active and bus is live in
// the portal, but the REST API key + docs are still being provisioned by
// TripJack (email sent 2026-09-07). Everything below is wired and typed; the
// bits that need the real docs are marked `TODO(tripjack-docs)` — endpoint
// paths and a few response field paths. The RouteOption mapping is final.
//
// Flow (TripJack bus, from the portal URL shape ?fid=2732&tid=2575&d=YYYY-MM-DD):
//   1. city list  -> numeric cityId for `from` / `to` (names won't work)
//   2. bus search -> list of services (operator, timings, min fare, seats)
//   3. seat layout / review / book  -> later, when RouteMitra hosts checkout
//
// Auth: every request carries header `apikey: <TRIPJACK_API_KEY>`, POST + JSON,
// response envelope `{ status: { success, httpStatus }, ... }` (same as their
// flight/hotel APIs).

import type { RouteOption } from "@/types/route";

const API_BASE = (
  process.env.TRIPJACK_API_BASE || "https://apitest.tripjack.com"
).replace(/\/$/, "");
const API_KEY = process.env.TRIPJACK_API_KEY;

// TODO(tripjack-docs): confirm exact paths. Their pattern is /<svc>/v1/<method>
// — flight = /fms/v1/..., hotel = /hms/v1/...; bus is most likely /bms/v1/... .
const PATH_CITY_LIST = "/bms/v1/city-list";
const PATH_SEARCH = "/bms/v1/search";

export function tripjackBusEnabled(): boolean {
  return Boolean(API_KEY);
}

async function tjPost<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        apikey: API_KEY as string,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      console.error(`[tripjack-bus] ${path} ${res.status}: ${await res.text()}`);
      return null;
    }
    const json = (await res.json()) as { status?: { success?: boolean } } & T;
    if (json?.status && json.status.success === false) {
      console.error(`[tripjack-bus] ${path} status.success=false`, json.status);
      return null;
    }
    return json;
  } catch (err) {
    console.error(`[tripjack-bus] ${path} call failed:`, err);
    return null;
  }
}

// --- city id resolution -----------------------------------------------------
// TripJack keys routes on numeric cityIds, not names. The full city list is
// small and static-ish — fetch once, cache for the process lifetime.
type TjCity = { id: number; name: string };
let cityCache: TjCity[] | null = null;

async function cityList(): Promise<TjCity[]> {
  if (cityCache) return cityCache;
  const json = await tjPost<{ cities?: unknown[] }>(PATH_CITY_LIST, {});
  // TODO(tripjack-docs): confirm the array key + each row's id/name fields.
  const rows = (json?.cities ?? []) as Record<string, unknown>[];
  cityCache = rows
    .map((r) => ({
      id: Number(r.id ?? r.cityId ?? r.code),
      name: String(r.name ?? r.cityName ?? "").trim(),
    }))
    .filter((c) => Number.isFinite(c.id) && c.name);
  return cityCache;
}

async function cityId(name: string): Promise<number | null> {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  const cities = await cityList();
  const exact = cities.find((c) => c.name.toLowerCase() === key);
  if (exact) return exact.id;
  // "Jaipur" should match "Jaipur (Rajasthan)"; prefer the shortest such name
  const partial = cities
    .filter((c) => c.name.toLowerCase().startsWith(key))
    .sort((a, b) => a.name.length - b.name.length)[0];
  return partial?.id ?? null;
}

// --- search + map ---------------------------------------------------------
function hhmm(iso: string): string {
  // accepts "2026-09-08T23:45:00" or "23:45" or "23:45:00"
  const t = /T(\d{2}:\d{2})/.exec(iso)?.[1] ?? iso.trim().slice(0, 5);
  return /^\d{2}:\d{2}$/.test(t) ? t : "--:--";
}

function minutesBetween(depIso: string, arrIso: string): number {
  const d = Date.parse(depIso);
  const a = Date.parse(arrIso);
  if (Number.isFinite(d) && Number.isFinite(a) && a > d) {
    return Math.round((a - d) / 60000);
  }
  return 0;
}

/** Map a TripJack bus search response into RouteOption[]. Field paths marked
 *  TODO come straight from the (pending) TripJack bus docs. Exported for tests. */
export function mapTripjackBusResults(json: unknown): RouteOption[] {
  // TODO(tripjack-docs): confirm the results array key.
  const rows =
    ((json as { searchResult?: { buses?: unknown[] } })?.searchResult?.buses ??
      (json as { buses?: unknown[] })?.buses ??
      []) as Record<string, unknown>[];

  return rows
    .map((r): RouteOption | null => {
      // TODO(tripjack-docs): confirm every field path in this block.
      const operator = String(
        r.serviceName ?? r.travelName ?? r.operatorName ?? "",
      ).trim();
      const busType = String(r.busType ?? r.serviceType ?? "").trim();
      const depIso = String(r.departureTime ?? r.doj ?? "");
      const arrIso = String(r.arrivalTime ?? "");
      const fareRaw =
        r.netFare ??
        r.totalFare ??
        r.startingFare ??
        (r.fareDetails as { minFare?: number } | undefined)?.minFare ??
        0;
      const price = Math.round(Number(fareRaw));

      if (!operator || price <= 0) return null;

      const durMin =
        Number(r.durationMin ?? r.duration) || minutesBetween(depIso, arrIso);

      return {
        mode: "bus",
        operator: busType ? `${operator} (${busType})` : operator,
        price,
        duration_min: durMin,
        departure: hhmm(depIso),
        arrival: hhmm(arrIso),
        // Booking still hands off to a partner platform (RouteMitra doesn't
        // sell tickets yet) — normalize() turns this into a RedBus route+date
        // deep link with the Cuelinks wrapper. Flip to a TripJack checkout
        // link + indicative:false once RouteMitra hosts the seat-select flow.
        link: "https://www.redbus.in/",
        indicative: true,
        source: "tripjack",
      };
    })
    .filter((o): o is RouteOption => o !== null)
    .sort((a, b) => a.price - b.price)
    .slice(0, 20);
}

/**
 * Live bus search via TripJack. Returns [] (never throws) so the bus adapter
 * can fall back to sample data. `date` is ISO yyyy-mm-dd; defaults to +2 days.
 */
export async function tripjackBusSearch(
  from: string,
  to: string,
  date: string | null,
): Promise<RouteOption[]> {
  if (!API_KEY) return [];

  const [fromId, toId] = await Promise.all([cityId(from), cityId(to)]);
  if (!fromId || !toId) {
    console.warn(`[tripjack-bus] no cityId for ${from} (${fromId}) / ${to} (${toId})`);
    return [];
  }

  const doj =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10);

  // TODO(tripjack-docs): confirm the search request shape. Likely one of:
  //   { searchQuery: { sourceId, destinationId, doj } }
  //   { sourceCity: fromId, destinationCity: toId, doj }
  const json = await tjPost(PATH_SEARCH, {
    searchQuery: { sourceId: fromId, destinationId: toId, doj },
  });
  if (!json) return [];
  return mapTripjackBusResults(json);
}
