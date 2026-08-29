// Normalized shape every provider adapter must return. Real APIs (Duffel,
// RedBus, IRCTC PSPs) get mapped into this in later phases — the rest of
// the app only ever sees RouteOption / RouteResult.

export type Mode = "bus" | "train" | "flight";

export interface RouteOption {
  mode: Mode;
  operator: string;
  price: number; // INR
  duration_min: number;
  departure: string; // "HH:MM"
  arrival: string; // "HH:MM"
  link: string; // deep link to the booking platform
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
}

export type SortKey = "price" | "duration_min";
