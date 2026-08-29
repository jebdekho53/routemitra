// Sample / dummy data — migrated from routemitra-demo/data.js. Same shape a
// real aggregator backend returns. Adapters in lib/adapters/* read from here
// until real APIs are wired up (Phase 4+).

import type { RouteOption } from "@/types/route";

interface SampleRoute {
  from: string;
  to: string;
  options: RouteOption[];
}

export const ROUTES: Record<string, SampleRoute> = {
  "pune|bengaluru": {
    from: "Pune",
    to: "Bengaluru",
    options: [
      { mode: "bus", operator: "VRL Travels (AC Sleeper)", price: 950, duration_min: 660, departure: "20:30", arrival: "07:30", link: "https://www.redbus.in/" },
      { mode: "bus", operator: "Orange Tours & Travels", price: 1100, duration_min: 600, departure: "21:00", arrival: "07:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Udyan Express (11301)", price: 610, duration_min: 1140, departure: "08:10", arrival: "04:10", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Hampi Express (16591)", price: 590, duration_min: 1200, departure: "20:20", arrival: "17:20", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-2341", price: 2899, duration_min: 80, departure: "14:20", arrival: "15:40", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "Air India AI-505", price: 3450, duration_min: 85, departure: "09:00", arrival: "10:25", link: "https://www.goibibo.com/" },
    ],
  },
  "mumbai|goa": {
    from: "Mumbai",
    to: "Goa",
    options: [
      { mode: "bus", operator: "Neeta Tours (AC Seater)", price: 800, duration_min: 540, departure: "22:00", arrival: "07:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Konkan Kanya Express (10111)", price: 425, duration_min: 660, departure: "23:00", arrival: "10:00", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "SpiceJet SG-146", price: 2450, duration_min: 70, departure: "11:10", arrival: "12:20", link: "https://www.goibibo.com/" },
      { mode: "flight", operator: "IndiGo 6E-6177", price: 2199, duration_min: 65, departure: "17:45", arrival: "18:50", link: "https://www.cleartrip.com/" },
    ],
  },
  "delhi|jaipur": {
    from: "Delhi",
    to: "Jaipur",
    options: [
      { mode: "bus", operator: "RSRTC Volvo AC", price: 550, duration_min: 300, departure: "07:00", arrival: "12:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Ajmer Shatabdi (12015)", price: 445, duration_min: 270, departure: "06:05", arrival: "10:35", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "Air India AI-9821", price: 3299, duration_min: 55, departure: "19:15", arrival: "20:10", link: "https://www.cleartrip.com/" },
    ],
  },
  "chennai|hyderabad": {
    from: "Chennai",
    to: "Hyderabad",
    options: [
      { mode: "bus", operator: "KPN Travels (AC Sleeper)", price: 1050, duration_min: 540, departure: "21:30", arrival: "06:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Charminar Express (12760)", price: 480, duration_min: 780, departure: "18:40", arrival: "07:40", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-6301", price: 2199, duration_min: 75, departure: "12:30", arrival: "13:45", link: "https://www.goibibo.com/" },
    ],
  },
  "mumbai|delhi": {
    from: "Mumbai",
    to: "Delhi",
    options: [
      { mode: "train", operator: "Rajdhani Express (12951)", price: 1965, duration_min: 960, departure: "16:35", arrival: "08:35", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "Vistara UK-995", price: 4899, duration_min: 130, departure: "08:00", arrival: "10:10", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "IndiGo 6E-2312", price: 3999, duration_min: 135, departure: "15:20", arrival: "17:35", link: "https://www.goibibo.com/" },
    ],
  },
};

function slugCity(s: string): string {
  return (s || "").trim().toLowerCase();
}

export function routeKey(from: string, to: string): string {
  return `${slugCity(from)}|${slugCity(to)}`;
}

// Returns the sample options for a route (either direction), or [] if unknown.
export function getSampleOptions(from: string, to: string): RouteOption[] {
  const direct = ROUTES[routeKey(from, to)];
  if (direct) return direct.options;
  const reversed = ROUTES[routeKey(to, from)];
  if (reversed) return reversed.options;
  return [];
}

export function listSampleRoutes(): { from: string; to: string }[] {
  return Object.values(ROUTES).map((r) => ({ from: r.from, to: r.to }));
}
