// Canonicalizes what a user typed (a nickname, an old name, or an IATA
// code) to the one spelling the rest of the app keys data on (sample
// routes, STATIONS, IATA). Without this, "Bangalore" resolved a train/flight
// via lib/stations.ts's/lib/iata.ts's own alias entries but missed bus data,
// which is keyed on the literal city string in lib/sample-data.ts — and
// "Bombay" or "DEL" matched nothing anywhere.

import { AIRPORT_CITY } from "@/lib/iata";

const NICKNAMES: Record<string, string> = {
  bombay: "Mumbai",
  bangalore: "Bengaluru",
  madras: "Chennai",
  calcutta: "Kolkata",
  cochin: "Kochi",
  ernakulam: "Kochi",
  mysore: "Mysuru",
  vizag: "Visakhapatnam",
  vishakhapatnam: "Visakhapatnam",
  trivandrum: "Thiruvananthapuram",
  pondicherry: "Puducherry",
  gurgaon: "Gurugram",
  allahabad: "Prayagraj",
  poona: "Pune",
  baroda: "Vadodara",
  benares: "Varanasi",
  banaras: "Varanasi",
  mangalore: "Mangaluru",
  calicut: "Kozhikode",
  cawnpore: "Kanpur",
  simla: "Shimla",
  "new delhi": "Delhi",
};

function applyNickname(city: string): string {
  return NICKNAMES[city.toLowerCase()] ?? city;
}

export function canonicalCity(input: string): string {
  const raw = (input ?? "").trim();
  if (!raw) return raw;

  // 3-letter all-caps input that's a real IATA code -> resolve to its city
  // (e.g. "DEL", "BOM", "BLR"). Real Indian city names are rarely exactly
  // 3 letters, so this heuristic is safe.
  if (/^[A-Za-z]{3}$/.test(raw)) {
    const city = AIRPORT_CITY[raw.toUpperCase()];
    if (city) return applyNickname(city);
  }

  return applyNickname(raw);
}
