// Phase 7 — deep links + tracking params.
//
// "Book karein" should land the user on the partner site *already searching
// the same route*, not on the partner's homepage. We build per-platform
// deep links by mode:
//
//   bus    -> redbus.in/bus-tickets/<from>-to-<to>
//   train  -> confirmtkt.com/trains/<from>-to-<to>-train-tickets
//   flight -> skyscanner (when we know both IATA codes) else Google Flights
//
// Every link also carries UTM + ref params for attribution.

import type { Mode } from "@/types/route";
import { toIata } from "@/lib/iata";

// A few city names the booking platforms slug differently. Extend if a
// specific route's deep link 404s.
const CITY_ALIAS: Record<string, string> = {
  bombay: "mumbai",
  "new delhi": "delhi",
  gurgaon: "gurugram",
  pondicherry: "puducherry",
};

function slug(s: string): string {
  const key = s.trim().toLowerCase();
  return (CITY_ALIAS[key] ?? key)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function withTracking(
  base: string,
  mode: Mode,
  from: string,
  to: string,
  extra: Record<string, string> = {},
): string {
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return base;
  }
  url.searchParams.set("utm_source", "routemitra");
  url.searchParams.set("utm_medium", "aggregator");
  url.searchParams.set("utm_campaign", `${mode}_book`);
  url.searchParams.set("ref", `routemitra:${slug(from)}-${slug(to)}`);
  for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);
  return url.toString();
}

export function bookingLink(
  mode: Mode,
  from: string,
  to: string,
  fallbackUrl: string,
): string {
  const f = slug(from);
  const t = slug(to);

  if (mode === "bus") {
    return withTracking(
      `https://www.redbus.in/bus-tickets/${f}-to-${t}`,
      mode,
      from,
      to,
    );
  }

  if (mode === "train") {
    return withTracking(
      `https://www.confirmtkt.com/trains/${f}-to-${t}-train-tickets`,
      mode,
      from,
      to,
    );
  }

  if (mode === "flight") {
    const fi = toIata(from);
    const ti = toIata(to);
    if (fi && ti) {
      return withTracking(
        `https://www.skyscanner.co.in/transport/flights/${fi.toLowerCase()}/${ti.toLowerCase()}/`,
        mode,
        from,
        to,
      );
    }
    return withTracking("https://www.google.com/travel/flights", mode, from, to, {
      q: `flights from ${from} to ${to}`,
    });
  }

  return withTracking(fallbackUrl, mode, from, to);
}
