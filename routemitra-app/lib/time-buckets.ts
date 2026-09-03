// Time-of-day buckets for the departure / arrival filters on the results
// page. Four 6-hour windows, like Skyscanner's slider but as tappable chips.

export interface TimeBucket {
  id: number;
  /** inclusive start hour */
  from: number;
  /** exclusive end hour */
  to: number;
  label: string; // "06–12"
  word: string; // "Morning"
  icon: string; // clock-ish emoji
}

export const TIME_BUCKETS: TimeBucket[] = [
  { id: 0, from: 0, to: 6, label: "00–06", word: "Night", icon: "🌙" },
  { id: 1, from: 6, to: 12, label: "06–12", word: "Morning", icon: "🌅" },
  { id: 2, from: 12, to: 18, label: "12–18", word: "Afternoon", icon: "🌇" },
  { id: 3, from: 18, to: 24, label: "18–24", word: "Evening", icon: "🌃" },
];

/** "HH:MM" -> bucket id (0..3). Bad input -> -1. */
export function bucketOf(hhmm: string): number {
  const h = Number((hhmm || "").slice(0, 2));
  if (!Number.isFinite(h) || h < 0 || h > 23) return -1;
  return Math.min(3, Math.floor(h / 6));
}
