// Phase 7 — deep links + tracking params.
// Every "Book karein" link carries UTM + ref params so partner platforms
// (and our own analytics) can attribute the traffic to RouteMitra.

import type { Mode } from "@/types/route";

export function bookingLink(
  mode: Mode,
  from: string,
  to: string,
  baseUrl: string,
): string {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return baseUrl;
  }
  url.searchParams.set("utm_source", "routemitra");
  url.searchParams.set("utm_medium", "aggregator");
  url.searchParams.set("utm_campaign", `${mode}_book`);
  url.searchParams.set(
    "ref",
    `routemitra:${from.toLowerCase()}-${to.toLowerCase()}`,
  );
  return url.toString();
}
