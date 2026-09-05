// Phase 7 — click tracking.
//   POST /api/track   body: { mode, operator, price, from, to, indicative }
//     -> insert a row into `clicks` (or console.log if no DATABASE_URL)
//   GET  /api/track    -> aggregate counts (traction story for partner talks)

import { NextResponse } from "next/server";
import { sql, dbEnabled, ensureSchema } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import type { Mode } from "@/types/route";

interface TrackBody {
  mode: Mode;
  operator: string;
  price?: number;
  from: string;
  to: string;
  indicative?: boolean;
}

export async function POST(request: Request) {
  const rl = await rateLimit("track-post", clientIp(request), 30, "1 m");
  if (!rl.ok) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  let body: TrackBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { mode, operator, from, to } = body;
  if (!mode || !operator || !from || !to) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const price = Number.isFinite(body.price) ? Math.round(body.price!) : null;
  const indicative = Boolean(body.indicative);

  if (!dbEnabled || !sql) {
    console.log(
      `[track] ${mode} · ${operator} · ₹${price ?? "?"} · ${from}→${to}` +
        (indicative ? " (indicative)" : ""),
    );
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    await ensureSchema();
    await sql`
      INSERT INTO clicks (mode, operator, price, from_city, to_city, indicative)
      VALUES (${mode}, ${operator}, ${price}, ${from.toLowerCase()}, ${to.toLowerCase()}, ${indicative})
    `;
    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[track] insert failed:", err);
    return NextResponse.json({ ok: false, stored: false }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const rl = await rateLimit("track-get", clientIp(request), 20, "1 m");
  if (!rl.ok) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  if (!dbEnabled || !sql) {
    return NextResponse.json({ enabled: false, byMode: [], topRoutes: [] });
  }
  try {
    await ensureSchema();
    const byMode = await sql`
      SELECT mode, count(*)::int AS clicks
      FROM clicks GROUP BY mode ORDER BY clicks DESC
    `;
    const topRoutes = await sql`
      SELECT from_city, to_city, count(*)::int AS clicks
      FROM clicks GROUP BY from_city, to_city ORDER BY clicks DESC LIMIT 20
    `;
    const total = await sql`SELECT count(*)::int AS n FROM clicks`;
    return NextResponse.json({
      enabled: true,
      total: total[0]?.n ?? 0,
      byMode,
      topRoutes,
    });
  } catch (err) {
    console.error("[track] summary failed:", err);
    return NextResponse.json({ enabled: true, error: true }, { status: 500 });
  }
}
