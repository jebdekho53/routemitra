// Big cities/towns people actually search for that aren't their own entry in
// the generated DISTRICT_HUBS table (which only covers the 749 IR districts).
// Mostly metro satellites (Noida is in "Gautam Buddha Nagar", Navi Mumbai
// straddles Thane/Raigad), industrial cities, and pilgrimage/hill towns.
//
// Each row is shaped like a DISTRICT_HUBS row: nearest railhead + airport.
// resolveStation()/resolveAirport() fall back here after DISTRICT_HUBS. When
// the station code is a "major railhead" (in MAJOR_STATION_CITY) the Phase 32
// proxy caveat surfaces automatically ("Nearest station used for Noida via
// Delhi …"); when it's the town's own junction (TATA, KGP, LNL …) it resolves
// clean with no caveat, which is correct.

import type { DistrictHub } from "@/lib/district-hubs";

export const EXTRA_HUBS: Record<string, DistrictHub> = {
  // --- NCR ---
  noida: { station: "NDLS", iata: "DEL" },
  "greater noida": { station: "NDLS", iata: "DEL" },
  // --- Mumbai metro ---
  "navi mumbai": { station: "CSMT", iata: "BOM" },
  kalyan: { station: "CSMT", iata: "BOM" },
  "vasai virar": { station: "CSMT", iata: "BOM" },
  vasai: { station: "CSMT", iata: "BOM" },
  virar: { station: "CSMT", iata: "BOM" },
  ulhasnagar: { station: "CSMT", iata: "BOM" },
  bhiwandi: { station: "CSMT", iata: "BOM" },
  // --- Pune metro ---
  "pimpri chinchwad": { station: "PUNE", iata: "PNQ" },
  pimpri: { station: "PUNE", iata: "PNQ" },
  lonavala: { station: "LNL", iata: "PNQ" },
  mahabaleshwar: { station: "PUNE", iata: "PNQ" },
  // --- industrial belt (own junctions) ---
  jamshedpur: { station: "TATA", iata: "IXR" },
  rourkela: { station: "ROU", iata: "IXR" },
  durgapur: { station: "DGR", iata: "CCU" },
  asansol: { station: "ASN", iata: "CCU" },
  kharagpur: { station: "KGP", iata: "CCU" },
  bhilai: { station: "R", iata: "RPR" },
  // --- pilgrimage / spiritual ---
  katra: { station: "SVDK", iata: "IXJ" },
  "vaishno devi": { station: "SVDK", iata: "IXJ" },
  shirdi: { station: "SNSI", iata: "SAG" },
  rishikesh: { station: "RKSH", iata: "DED" },
  // --- hill / remote (nearest railhead, caveat shows) ---
  haldwani: { station: "KGM", iata: "DED" },
  nainital: { station: "KGM", iata: "DED" },
  manali: { station: "CDG", iata: "IXC" },
  gangtok: { station: "NJP", iata: "IXB" },
  ooty: { station: "CBE", iata: "CJB" },
  udhagamandalam: { station: "CBE", iata: "CJB" },
  munnar: { station: "ERS", iata: "COK" },
  kodaikanal: { station: "MDU", iata: "IXM" },
};

/** Title-cased names for the search autocomplete (native <datalist>).
 *  A few keys are alternate spellings of the same place — de-duped by label. */
export const EXTRA_CITIES: string[] = Array.from(
  new Set(
    Object.keys(EXTRA_HUBS).map((k) =>
      k.replace(/\b\w/g, (c) => c.toUpperCase()),
    ),
  ),
);
