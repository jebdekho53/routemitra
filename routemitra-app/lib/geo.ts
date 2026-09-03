// Geocoding + distance helpers (Phase 11).
// Free-text address -> lat/lon via OpenStreetMap Nominatim (free, no key).
// Set GOOGLE_MAPS_API_KEY to use Google Geocoding instead (more accurate).

import { getCachedSearch, setCachedSearch } from "@/lib/cache";
import type { RouteResult } from "@/types/route";

export interface GeoPoint {
  lat: number;
  lon: number;
  label: string;
}

export function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Reuse the search cache store (same Upstash instance) with a geo: prefix.
// The value shape is abused a little but it's just JSON in Redis.
async function cacheGet(key: string): Promise<GeoPoint | null> {
  const v = (await getCachedSearch(key)) as unknown as GeoPoint | null;
  return v && typeof v.lat === "number" ? v : null;
}
async function cacheSet(key: string, p: GeoPoint): Promise<void> {
  await setCachedSearch(key, p as unknown as RouteResult);
}

export async function geocode(query: string): Promise<GeoPoint | null> {
  const q = query.trim();
  if (!q) return null;
  const key = `geo:${q.toLowerCase()}`;

  const cached = await cacheGet(key);
  if (cached) return cached;

  try {
    const point = process.env.GOOGLE_MAPS_API_KEY
      ? await geocodeGoogle(q)
      : await geocodeNominatim(q);
    if (point) await cacheSet(key, point);
    return point;
  } catch (err) {
    console.error("[geo] geocode failed:", err);
    return null;
  }
}

async function geocodeNominatim(q: string): Promise<GeoPoint | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "in");
  const res = await fetch(url, {
    headers: {
      // Nominatim usage policy requires an identifying UA
      "User-Agent": "RouteMitra/1.0 (https://routemitra.vercel.app)",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as {
    lat: string;
    lon: string;
    display_name: string;
  }[];
  if (!rows.length) return null;
  return {
    lat: parseFloat(rows[0].lat),
    lon: parseFloat(rows[0].lon),
    label: rows[0].display_name,
  };
}

// lat/lon -> nearest street address (for the "use my location" button).
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<GeoPoint | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const key = `georev:${lat.toFixed(4)},${lon.toFixed(4)}`;

  const cached = await cacheGet(key);
  if (cached) return cached;

  try {
    const point = process.env.GOOGLE_MAPS_API_KEY
      ? await reverseGoogle(lat, lon)
      : await reverseNominatim(lat, lon);
    if (point) await cacheSet(key, point);
    return point;
  } catch (err) {
    console.error("[geo] reverse geocode failed:", err);
    return null;
  }
}

async function reverseNominatim(
  lat: number,
  lon: number,
): Promise<GeoPoint | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("zoom", "18");
  const res = await fetch(url, {
    headers: {
      "User-Agent": "RouteMitra/1.0 (https://routemitra.vercel.app)",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const row = (await res.json()) as { display_name?: string };
  if (!row.display_name) return null;
  return { lat, lon, label: row.display_name };
}

async function reverseGoogle(
  lat: number,
  lon: number,
): Promise<GeoPoint | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lon}`);
  url.searchParams.set("region", "in");
  url.searchParams.set("key", process.env.GOOGLE_MAPS_API_KEY!);
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    results: { formatted_address: string }[];
  };
  const r = json.results?.[0];
  if (!r) return null;
  return { lat, lon, label: r.formatted_address };
}

async function geocodeGoogle(q: string): Promise<GeoPoint | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", q);
  url.searchParams.set("region", "in");
  url.searchParams.set("key", process.env.GOOGLE_MAPS_API_KEY!);
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    results: { geometry: { location: { lat: number; lng: number } }; formatted_address: string }[];
  };
  const r = json.results?.[0];
  if (!r) return null;
  return {
    lat: r.geometry.location.lat,
    lon: r.geometry.location.lng,
    label: r.formatted_address,
  };
}
