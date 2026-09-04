// City name -> primary IRCTC station code, for the train adapter.
// Extend as routes grow.

import { DISTRICT_HUBS } from "@/lib/district-hubs";

const STATIONS: Record<string, string> = {
  agra: "AGC",
  ahmedabad: "ADI",
  ajmer: "AII",
  allahabad: "PRYJ",
  prayagraj: "PRYJ",
  amritsar: "ASR",
  aurangabad: "AWB",
  bengaluru: "SBC",
  bangalore: "SBC",
  bhopal: "BPL",
  bhubaneswar: "BBS",
  chandigarh: "CDG",
  chennai: "MAS",
  coimbatore: "CBE",
  dehradun: "DDN",
  delhi: "NDLS",
  "new delhi": "NDLS",
  ernakulam: "ERS",
  kochi: "ERS",
  cochin: "ERS",
  goa: "MAO",
  madgaon: "MAO",
  gorakhpur: "GKP",
  guwahati: "GHY",
  gwalior: "GWL",
  haridwar: "HW",
  hyderabad: "SC",
  secunderabad: "SC",
  indore: "INDB",
  jaipur: "JP",
  jammu: "JAT",
  jhansi: "VGLJ",
  jodhpur: "JU",
  kanpur: "CNB",
  kolkata: "HWH",
  howrah: "HWH",
  lucknow: "LKO",
  ludhiana: "LDH",
  madurai: "MDU",
  mangalore: "MAQ",
  mangaluru: "MAQ",
  mumbai: "CSMT",
  mysore: "MYS",
  mysuru: "MYS",
  nagpur: "NGP",
  nashik: "NK",
  patna: "PNBE",
  pune: "PUNE",
  raipur: "R",
  rajkot: "RJT",
  ranchi: "RNC",
  surat: "ST",
  thiruvananthapuram: "TVC",
  trivandrum: "TVC",
  tirupati: "TPTY",
  udaipur: "UDZ",
  vadodara: "BRC",
  varanasi: "BSB",
  vijayawada: "BZA",
  visakhapatnam: "VSKP",
  vizag: "VSKP",
};

export function toStationCode(city: string): string | null {
  return resolveStation(city)?.code ?? null;
}

// Friendly names for the ~55 "nearest major railhead" codes district-hubs.ts
// falls back to (mirrors scratchpad/gen-district-hubs.mjs's MAJOR table). If
// a resolved code is one of these, the match came from that geo fallback —
// not the searched place's own station — so callers can be upfront about it
// (erail/IRCTC only know the two codes we hand them; a route between two
// proxy stations can look "real" — a live train, live times — while not
// actually serving either place directly).
const MAJOR_STATION_CITY: Record<string, string> = {
  AGC: "Agra", ADI: "Ahmedabad", AII: "Ajmer", PRYJ: "Prayagraj",
  ASR: "Amritsar", AWB: "Aurangabad", SBC: "Bengaluru", BPL: "Bhopal",
  BBS: "Bhubaneswar", CDG: "Chandigarh", MAS: "Chennai", CBE: "Coimbatore",
  DDN: "Dehradun", NDLS: "Delhi", ERS: "Kochi", MAO: "Goa",
  GKP: "Gorakhpur", GHY: "Guwahati", GWL: "Gwalior", HW: "Haridwar",
  SC: "Hyderabad", INDB: "Indore", JP: "Jaipur", JAT: "Jammu",
  VGLJ: "Jhansi", JU: "Jodhpur", CNB: "Kanpur", HWH: "Kolkata",
  LKO: "Lucknow", LDH: "Ludhiana", MDU: "Madurai", MAQ: "Mangaluru",
  CSMT: "Mumbai", MYS: "Mysuru", NGP: "Nagpur", NK: "Nashik",
  PNBE: "Patna", PUNE: "Pune", R: "Raipur", RJT: "Rajkot",
  RNC: "Ranchi", ST: "Surat", TVC: "Thiruvananthapuram", TPTY: "Tirupati",
  UDZ: "Udaipur", BRC: "Vadodara", BSB: "Varanasi", BZA: "Vijayawada",
  VSKP: "Visakhapatnam",
  AGTL: "Agartala", SCL: "Silchar", DMV: "Dimapur", NJP: "New Jalpaiguri (Darjeeling/Sikkim)",
  BLGT: "Balurghat", RGJ: "Raiganj",
};

export interface ResolvedStation {
  code: string;
  /** set when `code` is a "nearest railhead" proxy, not the searched place's own station */
  viaCity?: string;
}

export function resolveStation(city: string): ResolvedStation | null {
  const key = city.trim().toLowerCase();
  if (STATIONS[key]) return { code: STATIONS[key] };
  const hub = DISTRICT_HUBS[key];
  if (!hub?.station) return null;
  const viaCity = MAJOR_STATION_CITY[hub.station];
  return viaCity ? { code: hub.station, viaCity } : { code: hub.station };
}

// Title-cased city names we can resolve to a station — used to populate the
// search autocomplete (native <datalist>, so no API call per keystroke).
export const STATION_CITIES: string[] = Array.from(
  new Set(
    Object.keys(STATIONS).map((k) =>
      k.replace(/\b\w/g, (c) => c.toUpperCase()),
    ),
  ),
).sort();
