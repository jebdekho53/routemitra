// Phase 15 — uptime-monitor ping target (UptimeRobot / Better Uptime).
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
