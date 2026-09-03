// GET /api/reverse-geocode?lat=28.61&lon=77.20
// Turns the browser's geolocation fix into a street address for the
// door-to-door "use my location" button. Server-side so Nominatim gets the
// required User-Agent and the result is cached like every other geocode.

import { NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/geo";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export async function GET(request: Request) {
  const rl = await rateLimit("georev", clientIp(request), 20, "1 m");
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests — try again in a moment." },
      { status: 429, headers: { "retry-after": "20" } },
    );
  }

  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  ) {
    return NextResponse.json({ error: "bad coordinates" }, { status: 400 });
  }

  const point = await reverseGeocode(lat, lon);
  if (!point) {
    return NextResponse.json(
      { error: "Couldn't resolve that location." },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { label: point.label, lat: point.lat, lon: point.lon },
    { headers: { "cache-control": "no-store" } },
  );
}
