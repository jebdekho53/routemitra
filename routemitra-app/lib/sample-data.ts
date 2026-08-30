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
  "delhi|varanasi": {
    from: "Delhi",
    to: "Varanasi",
    options: [
      { mode: "bus", operator: "UPSRTC AC Sleeper", price: 1250, duration_min: 780, departure: "18:30", arrival: "07:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Vande Bharat Express (22436)", price: 1720, duration_min: 480, departure: "06:00", arrival: "14:00", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Shiv Ganga Express (12560)", price: 640, duration_min: 690, departure: "20:10", arrival: "07:40", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-2053", price: 3650, duration_min: 85, departure: "09:35", arrival: "11:00", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "Air India AI-405", price: 4120, duration_min: 90, departure: "17:10", arrival: "18:40", link: "https://www.goibibo.com/" },
    ],
  },
  "bengaluru|chennai": {
    from: "Bengaluru",
    to: "Chennai",
    options: [
      { mode: "bus", operator: "KPN Travels (AC Sleeper)", price: 700, duration_min: 390, departure: "23:00", arrival: "05:30", link: "https://www.redbus.in/" },
      { mode: "bus", operator: "SRS Travels (Volvo)", price: 850, duration_min: 360, departure: "22:30", arrival: "04:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Shatabdi Express (12028)", price: 780, duration_min: 300, departure: "06:00", arrival: "11:00", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Brindavan Express (12640)", price: 190, duration_min: 390, departure: "07:50", arrival: "14:20", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-345", price: 2450, duration_min: 60, departure: "10:15", arrival: "11:15", link: "https://www.cleartrip.com/" },
    ],
  },
  "delhi|chandigarh": {
    from: "Delhi",
    to: "Chandigarh",
    options: [
      { mode: "bus", operator: "Volvo AC (HRTC)", price: 620, duration_min: 270, departure: "07:00", arrival: "11:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Shatabdi Express (12005)", price: 780, duration_min: 205, departure: "07:40", arrival: "11:05", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Kalka Shatabdi (12011)", price: 760, duration_min: 210, departure: "17:25", arrival: "20:55", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-2135", price: 3100, duration_min: 55, departure: "12:40", arrival: "13:35", link: "https://www.goibibo.com/" },
    ],
  },
  "hyderabad|bengaluru": {
    from: "Hyderabad",
    to: "Bengaluru",
    options: [
      { mode: "bus", operator: "Orange Travels (AC Sleeper)", price: 900, duration_min: 540, departure: "21:30", arrival: "06:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Kacheguda Express (17603)", price: 520, duration_min: 720, departure: "18:45", arrival: "06:45", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-537", price: 2299, duration_min: 70, departure: "09:20", arrival: "10:30", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "Akasa Air QP-1104", price: 2650, duration_min: 75, departure: "16:10", arrival: "17:25", link: "https://www.goibibo.com/" },
    ],
  },
  "mumbai|ahmedabad": {
    from: "Mumbai",
    to: "Ahmedabad",
    options: [
      { mode: "bus", operator: "Gujarat Travels (AC Sleeper)", price: 950, duration_min: 480, departure: "22:00", arrival: "06:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Shatabdi Express (12009)", price: 895, duration_min: 405, departure: "06:25", arrival: "13:10", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Gujarat Mail (12901)", price: 420, duration_min: 510, departure: "21:55", arrival: "06:25", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-6501", price: 2799, duration_min: 75, departure: "11:00", arrival: "12:15", link: "https://www.cleartrip.com/" },
    ],
  },
  "kolkata|delhi": {
    from: "Kolkata",
    to: "Delhi",
    options: [
      { mode: "train", operator: "Rajdhani Express (12301)", price: 2100, duration_min: 1020, departure: "16:50", arrival: "09:55", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Poorva Express (12303)", price: 780, duration_min: 1370, departure: "08:05", arrival: "07:00", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-2117", price: 4250, duration_min: 130, departure: "07:30", arrival: "09:40", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "Vistara UK-708", price: 5100, duration_min: 135, departure: "18:20", arrival: "20:35", link: "https://www.goibibo.com/" },
    ],
  },
  "jaipur|udaipur": {
    from: "Jaipur",
    to: "Udaipur",
    options: [
      { mode: "bus", operator: "RSRTC Volvo AC", price: 650, duration_min: 420, departure: "08:00", arrival: "15:00", link: "https://www.redbus.in/" },
      { mode: "bus", operator: "Jain Travels (Sleeper)", price: 550, duration_min: 450, departure: "23:30", arrival: "07:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Chetak Express (12981)", price: 340, duration_min: 435, departure: "22:05", arrival: "05:20", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-7431", price: 3900, duration_min: 60, departure: "13:15", arrival: "14:15", link: "https://www.goibibo.com/" },
    ],
  },
  "pune|mumbai": {
    from: "Pune",
    to: "Mumbai",
    options: [
      { mode: "bus", operator: "Shivneri Volvo AC", price: 480, duration_min: 210, departure: "09:00", arrival: "12:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Deccan Express (11008)", price: 115, duration_min: 210, departure: "07:00", arrival: "10:30", link: "https://www.confirmtkt.com/" },
      { mode: "train", operator: "Intercity Express (12127)", price: 340, duration_min: 195, departure: "14:15", arrival: "17:30", link: "https://www.irctc.co.in/" },
    ],
  },
  "delhi|lucknow": {
    from: "Delhi",
    to: "Lucknow",
    options: [
      { mode: "bus", operator: "UPSRTC Janrath AC", price: 780, duration_min: 480, departure: "21:00", arrival: "05:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Tejas Express (82501)", price: 1280, duration_min: 390, departure: "15:35", arrival: "22:05", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Lucknow Mail (12230)", price: 610, duration_min: 445, departure: "22:00", arrival: "05:25", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-895", price: 3350, duration_min: 75, departure: "10:40", arrival: "11:55", link: "https://www.cleartrip.com/" },
    ],
  },
  "bengaluru|goa": {
    from: "Bengaluru",
    to: "Goa",
    options: [
      { mode: "bus", operator: "VRL Travels (AC Sleeper)", price: 1100, duration_min: 660, departure: "21:00", arrival: "08:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Vasco Express (17309)", price: 480, duration_min: 840, departure: "15:15", arrival: "05:15", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-611", price: 2550, duration_min: 65, departure: "08:45", arrival: "09:50", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "Akasa Air QP-1391", price: 2950, duration_min: 70, departure: "17:30", arrival: "18:40", link: "https://www.goibibo.com/" },
    ],
  },
  "chennai|coimbatore": {
    from: "Chennai",
    to: "Coimbatore",
    options: [
      { mode: "bus", operator: "KPN Travels (AC Sleeper)", price: 850, duration_min: 480, departure: "22:00", arrival: "06:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Kovai Express (12675)", price: 265, duration_min: 435, departure: "06:15", arrival: "13:30", link: "https://www.confirmtkt.com/" },
      { mode: "train", operator: "Shatabdi Express (12243)", price: 720, duration_min: 400, departure: "07:10", arrival: "13:50", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-455", price: 2400, duration_min: 60, departure: "12:00", arrival: "13:00", link: "https://www.goibibo.com/" },
    ],
  },
  "ahmedabad|jaipur": {
    from: "Ahmedabad",
    to: "Jaipur",
    options: [
      { mode: "bus", operator: "Ashapura Travels (Sleeper)", price: 900, duration_min: 570, departure: "21:30", arrival: "07:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Ashram Express (12915)", price: 540, duration_min: 585, departure: "18:35", arrival: "04:20", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-6789", price: 3550, duration_min: 75, departure: "14:20", arrival: "15:35", link: "https://www.cleartrip.com/" },
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
