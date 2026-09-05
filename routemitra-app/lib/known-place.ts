// Is this a real place we recognize, even if we have no transport data for
// it (yet)? Used to tell apart two very different empty-search cases:
// a typo/gibberish city (show the generic empty state) vs a real corridor
// we just don't have data for (say so honestly instead of implying it
// doesn't exist — see QA report 2026-09-05: Madurai<->Rameswaram etc. read
// as "broken" when shown the same message as a nonsense search).

import { DISTRICTS } from "@/lib/districts";
import { resolveStation } from "@/lib/stations";
import { resolveAirport } from "@/lib/iata";
import { canonicalCity } from "@/lib/city-alias";

const DISTRICT_SET = new Set(DISTRICTS.map((d) => d.toLowerCase()));

export function isKnownPlace(cityRaw: string): boolean {
  const city = canonicalCity(cityRaw).trim();
  if (!city) return false;
  if (DISTRICT_SET.has(city.toLowerCase())) return true;
  if (resolveStation(city)) return true;
  if (resolveAirport(city)) return true;
  return false;
}
