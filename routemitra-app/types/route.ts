// Normalized shape every provider adapter must return. Real APIs (Duffel,
// RedBus, IRCTC PSPs) get mapped into this — the rest of the app only ever
// sees RouteOption / RouteResult.

export type Mode = "bus" | "train" | "flight";

export interface RouteOption {
  mode: Mode;
  operator: string;
  price: number; // INR
  duration_min: number;
  departure: string; // "HH:MM"
  arrival: string; // "HH:MM"
  link: string; // deep link to the booking platform (with tracking params)
  /** true when the fare is a best-effort estimate, not a live quote */
  indicative?: boolean;
  /** where this option came from: "duffel", "rapidapi", "sample", ... */
  source?: string;
  /** Phase 11 — full trip incl. local legs, when origin/destination addresses given */
  door_to_door?: DoorToDoor;
}

export interface LocalLeg {
  from: string;
  to: string;
  provider: string; // "Uber (est.)" etc.
  price: number;
  duration_min: number;
  distance_km: number;
  link: string;
  estimated: true;
}

export interface DoorToDoor {
  origin: string; // resolved address label
  destination: string;
  access: LocalLeg | null; // home -> origin hub
  line_haul: { price: number; duration_min: number; label: string }; // the intercity option
  egress: LocalLeg | null; // dest hub -> final address
  buffer_min: number; // check-in / boarding margin
  total_price: number;
  total_duration_min: number;
}

export interface RouteResult {
  from: string;
  to: string;
  date: string | null;
  options: RouteOption[];
}

export interface SearchParams {
  from: string;
  to: string;
  date: string | null;
  /** Phase 11 — optional home / final addresses for door-to-door totals */
  origin?: string | null;
  destination?: string | null;
}

export type SortKey = "price" | "duration_min";
