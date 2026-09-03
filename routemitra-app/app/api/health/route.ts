// Phase 15 — uptime-monitor ping target (UptimeRobot / Better Uptime).
// Always 200 { ok: true } so a plain "is the site up" check stays green.
// `train_feed` is advisory: the last erail.in outcome seen by THIS serverless
// instance (per-instance, resets on cold start) — handy when debugging why a
// route shows sample trains, not a hard uptime signal.
import { NextResponse } from "next/server";
import { erailHealth } from "@/lib/adapters/erail";

export const dynamic = "force-dynamic";

export function GET() {
  const erail = erailHealth();
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    train_feed: {
      enabled: Boolean(process.env.TRAIN_ERAIL),
      last_ok: erail.ok,
      last_at: erail.at,
      last_rows: erail.rows,
      note: erail.note,
    },
  });
}
