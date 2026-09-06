// Local leg (cab) fare + ETA estimate for Phase 11 door-to-door.
//
// Uber/Ola/Rapido/inDrive don't offer usable public fare APIs for small
// partners anymore (Uber deprecated the estimate endpoint in 2022; Ola's dev
// platform is abandoned; Rapido/inDrive have none). So the fare is a
// transparent distance-based ESTIMATE, clearly labelled, plus ride-app deep
// links so the traveller can open their app of choice with pickup/drop
// pre-filled (Uber, Ola) or at least land on it (Rapido — no web pre-fill).

import type { GeoPoint } from "@/lib/geo";
import { haversineKm } from "@/lib/geo";
import type { Hub } from "@/lib/city-hubs";
import type { LocalLeg } from "@/types/route";

const BASE_FARE = 50; // INR
const PER_KM = 15; // INR
const MIN_FARE = 80; // INR
const URBAN_KMPH = 24; // avg incl. traffic
const MIN_MIN = 8;

type Pt = { lat: number; lon: number };

function uberDeepLink(pickup: Pt, drop: Pt): string {
  const u = new URL("https://m.uber.com/ul/");
  u.searchParams.set("action", "setPickup");
  u.searchParams.set("pickup[latitude]", String(pickup.lat));
  u.searchParams.set("pickup[longitude]", String(pickup.lon));
  u.searchParams.set("dropoff[latitude]", String(drop.lat));
  u.searchParams.set("dropoff[longitude]", String(drop.lon));
  u.searchParams.set("utm_source", "routemitra");
  return u.toString();
}

function olaDeepLink(pickup: Pt, drop: Pt): string {
  const u = new URL("https://book.olacabs.com/");
  u.searchParams.set("serviceType", "p2p");
  u.searchParams.set("utm_source", "routemitra");
  u.searchParams.set("lat", String(pickup.lat));
  u.searchParams.set("lng", String(pickup.lon));
  u.searchParams.set("drop_lat", String(drop.lat));
  u.searchParams.set("drop_lng", String(drop.lon));
  return u.toString();
}

// Rapido has no documented web deep link with pre-filled locations — this
// just opens the app / site.
const RAPIDO_LINK = "https://www.rapido.bike/";

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
  const pickup = isAccess ? home : hub;
  const drop = isAccess ? hub : home;
  return {
    from: isAccess ? homeLabel : hub.name,
    to: isAccess ? hub.name : homeLabel,
    provider: "Estimate",
    price,
    duration_min,
    distance_km: Math.round(km * 10) / 10,
    apps: [
      { name: "Uber", url: uberDeepLink(pickup, drop) },
      { name: "Ola", url: olaDeepLink(pickup, drop) },
      { name: "Rapido", url: RAPIDO_LINK },
    ],
    estimated: true,
  };
}
