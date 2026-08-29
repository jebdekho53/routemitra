// City name -> IATA airport code, for the flight adapter (Duffel needs codes).
// Extend as more routes are added.

const IATA: Record<string, string> = {
  pune: "PNQ",
  bengaluru: "BLR",
  bangalore: "BLR",
  mumbai: "BOM",
  delhi: "DEL",
  "new delhi": "DEL",
  goa: "GOI",
  jaipur: "JAI",
  chennai: "MAA",
  hyderabad: "HYD",
  kolkata: "CCU",
  ahmedabad: "AMD",
  kochi: "COK",
  cochin: "COK",
  varanasi: "VNS",
  lucknow: "LKO",
};

export function toIata(city: string): string | null {
  return IATA[city.trim().toLowerCase()] ?? null;
}
