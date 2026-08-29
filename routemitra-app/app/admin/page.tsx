// Phase 18 — admin visibility. Protected by Basic Auth in middleware.ts.
// Shows click traction, top routes, provider status, recent errors.

import type { Metadata } from "next";
import { sql, dbEnabled, ensureSchema } from "@/lib/db";
import { integrationStatus } from "@/lib/status";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

interface ModeRow { mode: string; clicks: number }
interface RouteRow { from_city: string; to_city: string; clicks: number }
interface ErrRow { message: string; digest: string | null; path: string | null; created_at: string }

async function loadData() {
  if (!dbEnabled || !sql) return null;
  try {
    await ensureSchema();
    const [total, byMode, topRoutes, recentErrors] = await Promise.all([
      sql`SELECT count(*)::int AS n FROM clicks`,
      sql`SELECT mode, count(*)::int AS clicks FROM clicks GROUP BY mode ORDER BY clicks DESC`,
      sql`SELECT from_city, to_city, count(*)::int AS clicks FROM clicks GROUP BY from_city, to_city ORDER BY clicks DESC LIMIT 15`,
      sql`SELECT message, digest, path, created_at FROM errors ORDER BY created_at DESC LIMIT 15`,
    ]);
    return {
      total: (total[0]?.n as number) ?? 0,
      byMode: byMode as unknown as ModeRow[],
      topRoutes: topRoutes as unknown as RouteRow[],
      recentErrors: recentErrors as unknown as ErrRow[],
    };
  } catch (err) {
    console.error("[admin] load failed:", err);
    return null;
  }
}

export default async function AdminPage() {
  const data = await loadData();
  const status = integrationStatus();

  return (
    <main className="wrap admin">
      <h1>RouteMitra · Admin</h1>

      <section className="admin-block">
        <h2>Providers</h2>
        <table className="admin-table">
          <tbody>
            {status.map((s) => (
              <tr key={s.key}>
                <td>{s.label}</td>
                <td>
                  <span className={`dot ${s.live ? "on" : "off"}`} />
                  {s.live ? "live" : "fallback"}
                </td>
                <td className="muted">{s.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {!data ? (
        <section className="admin-block">
          <h2>Traction</h2>
          <p className="muted">
            DATABASE_URL set nahi hai — click aur error data console mein ja raha
            hai, yahan nahi dikhega. Neon/Supabase connect karo.
          </p>
        </section>
      ) : (
        <>
          <section className="admin-block">
            <h2>Clicks — total {data.total}</h2>
            <table className="admin-table">
              <tbody>
                {data.byMode.length === 0 && (
                  <tr><td className="muted">abhi koi click nahi</td></tr>
                )}
                {data.byMode.map((r) => (
                  <tr key={r.mode}>
                    <td>{r.mode}</td>
                    <td>{r.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="admin-block">
            <h2>Top routes</h2>
            <table className="admin-table">
              <tbody>
                {data.topRoutes.map((r) => (
                  <tr key={`${r.from_city}-${r.to_city}`}>
                    <td>{r.from_city} → {r.to_city}</td>
                    <td>{r.clicks}</td>
                  </tr>
                ))}
                {data.topRoutes.length === 0 && (
                  <tr><td className="muted">abhi koi data nahi</td></tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="admin-block">
            <h2>Recent errors</h2>
            <table className="admin-table">
              <tbody>
                {data.recentErrors.map((e, i) => (
                  <tr key={i}>
                    <td>{new Date(e.created_at).toLocaleString("en-IN")}</td>
                    <td>{e.path ?? "—"}</td>
                    <td className="muted">{e.message}</td>
                  </tr>
                ))}
                {data.recentErrors.length === 0 && (
                  <tr><td className="muted">koi error nahi 🎉</td></tr>
                )}
              </tbody>
            </table>
            <p className="muted">
              Full error monitoring Phase 15 (Sentry) mein aayega.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
