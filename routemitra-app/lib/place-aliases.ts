// Big cities people actually search for that aren't their own entry in the
// generated DISTRICT_HUBS table — mostly metro satellite towns that sit inside
// a differently-named district (Noida is in "Gautam Buddha Nagar", Navi Mumbai
// straddles Thane/Raigad, Kalyan is in Thane). Each gets a hub the same shape
// as a DISTRICT_HUBS row: nearest major railhead + airport. resolveStation()/
// resolveAirport() fall back to this after DISTRICT_HUBS, and because the
// codes below are all "major railhead" ones, the proxy caveat ("Nearest
// station used for Noida via Delhi …") surfaces automatically.

import type { DistrictHub } from "@/lib/district-hubs";

export const EXTRA_HUBS: Record<string, DistrictHub> = {
  noida: { station: "NDLS", iata: "DEL" },
  "greater noida": { station: "NDLS", iata: "DEL" },
  "navi mumbai": { station: "CSMT", iata: "BOM" },
  kalyan: { station: "CSMT", iata: "BOM" },
};

/** Title-cased names for the search autocomplete (native <datalist>). */
export const EXTRA_CITIES: string[] = Object.keys(EXTRA_HUBS).map((k) =>
  k.replace(/\b\w/g, (c) => c.toUpperCase()),
);
