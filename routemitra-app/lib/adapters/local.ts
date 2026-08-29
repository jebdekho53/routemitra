// Local leg (cab) fare + ETA estimate for Phase 11 door-to-door.
//
// Uber/Ola/Rapido don't offer usable public fare APIs for small partners
// anymore, so this is a transparent distance-based ESTIMATE (clearly labelled
// in the UI). If UBER_SERVER_TOKEN is wired later, call Uber price estimates
// here; for now the math below is the source of truth.

import type { GeoPoint } from "@/lib/geo";
import { haversineKm } from "@/lib/geo";
import type { Hub } from "@/lib/city-hubs";
import type { LocalLeg } from "@/types/route";

const BASE_FARE = 50; // INR
const PER_KM = 15; // INR
const MIN_FARE = 80; // INR
const URBAN_KMPH = 24; // avg incl. traffic
const MIN_MIN = 8;

function uberDeepLink(
  pickup: { lat: number; lon: number },
  dropoff: { lat: number; lon: number },
): string {
  const u = new URL("https://m.uber.com/ul/");
  u.searchParams.set("action", "setPickup");
  u.searchParams.set("pickup[latitude]", String(pickup.lat));
  u.searchParams.set("pickup[longitude]", String(pickup.lon));
  u.searchParams.set("dropoff[latitude]", String(dropoff.lat));
  u.searchParams.set("dropoff[longitude]", String(dropoff.lon));
  u.searchParams.set("utm_source", "routemitra");
  return u.toString();
}

// road distance is longer than straight-line — bump by ~30%
const roadKm = (straightKm: number) => straightKm * 1.3;

/**
 * @param direction "access" = home -> hub, "egress" = hub -> home
 */
export function estimateLocalLeg(
  home: GeoPoint,
  homeLabel: string,
  hub: Hub,
  direction: "access" | "egress",
): LocalLeg {
  const km = roadKm(haversineKm(home, hub));
  const price = Math.max(MIN_FARE, Math.round(BASE_FARE + PER_KM * km));
  const duration_min = Math.max(MIN_MIN, Math.round((km / URBAN_KMPH) * 60));
  const isAccess = direction === "access";
  return {
    from: isAccess ? homeLabel : hub.name,
    to: isAccess ? hub.name : homeLabel,
    provider: "Uber (est.)",
    price,
    duration_min,
    distance_km: Math.round(km * 10) / 10,
    link: isAccess
      ? uberDeepLink(home, hub)
      : uberDeepLink(hub, home),
    estimated: true,
  };
}
