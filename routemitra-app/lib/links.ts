// Phase 7 — deep links + tracking params.
//
// "Book karein" should land the user on the partner site *already searching
// the same route (and date, if given)*, not on the partner's homepage.
//
//   bus    -> redbus.in/bus-tickets/<from>-to-<to>              [?onward=DD-Mon-YYYY]
//   train  -> confirmtkt.com/trains/<from>-to-<to>-train-tickets [?date=DD-MM-YYYY]
//   flight -> skyscanner.co.in/transport/flights/<iata>/<iata>/  [<yymmdd>/]
//             else google.com/travel/flights?q=flights from X to Y [on YYYY-MM-DD]
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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function isoParts(date?: string | null) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split("-");
  return { y, m, d };
}
const fmtDMY = (p: { y: string; m: string; d: string }) => `${p.d}-${p.m}-${p.y}`;
const fmtDMonY = (p: { y: string; m: string; d: string }) =>
  `${p.d}-${MONTHS[+p.m - 1]}-${p.y}`;
const fmtYYMMDD = (p: { y: string; m: string; d: string }) =>
  `${p.y.slice(2)}${p.m}${p.d}`;

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
  date?: string | null,
): string {
  const f = slug(from);
  const t = slug(to);
  const p = isoParts(date);

  if (mode === "bus") {
    return withTracking(
      `https://www.redbus.in/bus-tickets/${f}-to-${t}`,
      mode,
      from,
      to,
      p ? { onward: fmtDMonY(p) } : {},
    );
  }

  if (mode === "train") {
    return withTracking(
      `https://www.confirmtkt.com/trains/${f}-to-${t}-train-tickets`,
      mode,
      from,
      to,
      p ? { date: fmtDMY(p) } : {},
    );
  }

  if (mode === "flight") {
    const fi = toIata(from);
    const ti = toIata(to);
    if (fi && ti) {
      const datePath = p ? `${fmtYYMMDD(p)}/` : "";
      return withTracking(
        `https://www.skyscanner.co.in/transport/flights/${fi.toLowerCase()}/${ti.toLowerCase()}/${datePath}`,
        mode,
        from,
        to,
      );
    }
    return withTracking("https://www.google.com/travel/flights", mode, from, to, {
      q: `flights from ${from} to ${to}${date ? ` on ${date}` : ""}`,
    });
  }

  return withTracking(fallbackUrl, mode, from, to);
}
