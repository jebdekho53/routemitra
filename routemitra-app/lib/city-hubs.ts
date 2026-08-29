// Nearest transport hubs per city (Phase 11). lat/lon used to pick the hub
// closest to a geocoded home address, and to size the local (cab) leg.
// Start small; add cities as routes grow.

import type { Mode } from "@/types/route";

export interface Hub {
  code: string; // airport / station code, or short name for bus
  name: string;
  lat: number;
  lon: number;
}

export interface CityHubs {
  flight: Hub;
  train: Hub;
  bus: Hub;
}

export const CITY_HUBS: Record<string, CityHubs> = {
  delhi: {
    flight: { code: "DEL", name: "IGI Airport, Delhi", lat: 28.5562, lon: 77.1 },
    train: { code: "NDLS", name: "New Delhi Railway Station", lat: 28.6426, lon: 77.2191 },
    bus: { code: "ISBT-KG", name: "ISBT Kashmere Gate", lat: 28.6673, lon: 77.2305 },
  },
  mumbai: {
    flight: { code: "BOM", name: "CSMI Airport, Mumbai", lat: 19.0896, lon: 72.8656 },
    train: { code: "CSTM", name: "Mumbai CSMT", lat: 18.9401, lon: 72.8353 },
    bus: { code: "MUM-BC", name: "Mumbai Central Bus Stand", lat: 18.9712, lon: 72.8194 },
  },
  pune: {
    flight: { code: "PNQ", name: "Pune Airport", lat: 18.5822, lon: 73.9197 },
    train: { code: "PUNE", name: "Pune Junction", lat: 18.5286, lon: 73.8743 },
    bus: { code: "PUNE-SW", name: "Swargate Bus Stand", lat: 18.5011, lon: 73.8586 },
  },
  bengaluru: {
    flight: { code: "BLR", name: "Kempegowda Airport, Bengaluru", lat: 13.1986, lon: 77.7066 },
    train: { code: "SBC", name: "KSR Bengaluru City Junction", lat: 12.9773, lon: 77.5709 },
    bus: { code: "BLR-MJ", name: "Majestic (Kempegowda) Bus Stand", lat: 12.9776, lon: 77.5713 },
  },
  goa: {
    flight: { code: "GOI", name: "Dabolim Airport, Goa", lat: 15.3808, lon: 73.8314 },
    train: { code: "MAO", name: "Madgaon Junction", lat: 15.2793, lon: 73.9862 },
    bus: { code: "GOA-PJ", name: "Panaji (Kadamba) Bus Stand", lat: 15.4989, lon: 73.8278 },
  },
  jaipur: {
    flight: { code: "JAI", name: "Jaipur Airport", lat: 26.8242, lon: 75.8122 },
    train: { code: "JP", name: "Jaipur Junction", lat: 26.9196, lon: 75.7878 },
    bus: { code: "JAI-SS", name: "Sindhi Camp Bus Stand", lat: 26.9265, lon: 75.7972 },
  },
  chennai: {
    flight: { code: "MAA", name: "Chennai Airport", lat: 12.9941, lon: 80.1709 },
    train: { code: "MAS", name: "Chennai Central", lat: 13.0827, lon: 80.2755 },
    bus: { code: "CMBT", name: "Chennai (CMBT) Bus Terminus", lat: 13.0694, lon: 80.2 },
  },
  hyderabad: {
    flight: { code: "HYD", name: "RGI Airport, Hyderabad", lat: 17.2403, lon: 78.4294 },
    train: { code: "SC", name: "Secunderabad Junction", lat: 17.4344, lon: 78.5013 },
    bus: { code: "MGBS", name: "MG Bus Station, Hyderabad", lat: 17.3785, lon: 78.4818 },
  },
  varanasi: {
    flight: { code: "VNS", name: "Lal Bahadur Shastri Airport, Varanasi", lat: 25.4524, lon: 82.8593 },
    train: { code: "BSB", name: "Varanasi Junction", lat: 25.3271, lon: 82.9877 },
    bus: { code: "VNS-CK", name: "Cantt (Chaudhary Charan Singh) Bus Stand", lat: 25.3216, lon: 82.9905 },
  },
};

export function hubForCity(city: string, mode: Mode): Hub | null {
  const c = CITY_HUBS[city.trim().toLowerCase()];
  return c ? c[mode] : null;
}

// All hubs of a mode, flattened — used to find the hub nearest to a home point.
export function allHubs(mode: Mode): { city: string; hub: Hub }[] {
  return Object.entries(CITY_HUBS).map(([city, hubs]) => ({
    city,
    hub: hubs[mode],
  }));
}
