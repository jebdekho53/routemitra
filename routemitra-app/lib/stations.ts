// City name -> primary IRCTC station code, for the train adapter.
// Extend as routes grow.

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
  return STATIONS[city.trim().toLowerCase()] ?? null;
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
