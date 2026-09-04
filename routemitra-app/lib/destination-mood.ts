// Which visual "mood" a destination banner should use. A small curated map
// for the cities we actually have route pages for; anything unmapped (any
// district, say) falls back to "metro" — a safe generic skyline treatment.
export type Mood = "beach" | "heritage" | "metro";

const BEACH = new Set(["goa", "kochi", "cochin", "thiruvananthapuram", "trivandrum", "visakhapatnam", "vizag", "mangaluru", "mangalore", "puducherry", "pondicherry"]);
const HERITAGE = new Set(["jaipur", "udaipur", "jodhpur", "agra", "varanasi", "amritsar", "gwalior", "bikaner", "ajmer", "mysuru", "mysore", "hampi"]);

export function moodFor(city: string): Mood {
  const key = city.trim().toLowerCase();
  if (BEACH.has(key)) return "beach";
  if (HERITAGE.has(key)) return "heritage";
  return "metro";
}
