// Phase 13 — price-alert cron. Vercel Cron (or any scheduler) hits this on a
// schedule; it re-prices every active watch and emails the user when the
// cheapest fare has dropped below the last seen price.
//
// Auth: Authorization: Bearer $CRON_SECRET  (Vercel Cron sends this header
// when CRON_SECRET is set in project env).

import { NextResponse } from "next/server";
import { sql, dbEnabled, ensureSchema } from "@/lib/db";
import { runSearch } from "@/lib/search";
import { sendEmail, priceAlertEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface WatchRow {
  id: string;
  user_id: string;
  from_city: string;
  to_city: string;
  last_price: number | null;
  email: string;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  if (!dbEnabled || !sql) {
    return NextResponse.json({ ok: true, checked: 0, note: "no database" });
  }

  await ensureSchema();
  const watches = (await sql`
    SELECT w.id, w.user_id, w.from_city, w.to_city, w.last_price, u.email
    FROM route_watches w JOIN users u ON u.id = w.user_id
    WHERE w.active = true
    ORDER BY w.last_checked_at NULLS FIRST
    LIMIT 100
  `) as unknown as WatchRow[];

  let notified = 0;
  for (const w of watches) {
    try {
      const { result } = await runSearch({
        from: w.from_city,
        to: w.to_city,
        date: null,
      });
      const min = result.options.reduce(
        (m, o) => (o.price < m ? o.price : m),
        Infinity,
      );
      if (!Number.isFinite(min)) {
        await sql`UPDATE route_watches SET last_checked_at = now() WHERE id = ${w.id}`;
        continue;
      }
      const dropped = w.last_price != null && min < w.last_price;
      if (dropped) {
        await sendEmail(
          priceAlertEmail(
            w.email,
            { from: w.from_city, to: w.to_city },
            w.last_price!,
            min,
          ),
        );
        notified++;
      }
      await sql`
        UPDATE route_watches
        SET last_price = ${min}, last_checked_at = now()
        WHERE id = ${w.id}
      `;
    } catch (err) {
      console.error(`[cron] watch ${w.id} failed:`, err);
    }
  }

  return NextResponse.json({ ok: true, checked: watches.length, notified });
}
