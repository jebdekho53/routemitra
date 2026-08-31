// Phase 18 + 21 — admin dashboard. Gated by HTTP Basic Auth in proxy.ts.
// Product pulse (users / searches / clicks / watches), a feedback inbox you
// can action, top routes, provider status, and recent errors.

import type { Metadata } from "next";
import { sql, dbEnabled, ensureSchema } from "@/lib/db";
import { integrationStatus } from "@/lib/status";
import { adminMetrics } from "@/lib/metrics";
import { listFeedback } from "@/lib/feedback";
import { resolveFeedbackAction, reopenFeedbackAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

interface ErrRow {
  message: string;
  path: string | null;
  created_at: string;
}

const KIND_EMOJI: Record<string, string> = {
  idea: "💡",
  bug: "🐞",
  fare: "₹",
  support: "🙋",
  other: "💬",
};

async function loadErrors(): Promise<ErrRow[]> {
  if (!dbEnabled || !sql) return [];
  try {
    await ensureSchema();
    return (await sql`
      SELECT message, path, created_at FROM errors
      ORDER BY created_at DESC LIMIT 15
    `) as unknown as ErrRow[];
  } catch {
    return [];
  }
}

function fmt(ts: string) {
  return new Date(ts).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; feedback?: string }>;
}) {
  const sp = await searchParams;
  const days = sp.days === "1" ? 1 : sp.days === "30" ? 30 : 7;
  const fbFilter: "new" | "all" = sp.feedback === "all" ? "all" : "new";

  const [metrics, feedback, errors] = await Promise.all([
    adminMetrics(days),
    listFeedback(fbFilter, 60),
    loadErrors(),
  ]);
  const status = integrationStatus();

  const maxDaily = metrics
    ? Math.max(1, ...metrics.daily.map((d) => Math.max(d.searches, d.clicks)))
    : 1;

  return (
    <main className="wrap admin" id="main">
      <div className="admin-head">
        <h1>RouteMitra · Admin</h1>
        <div className="admin-tabs" aria-label="Time window">
          {[
            { d: 1, label: "24h" },
            { d: 7, label: "7 days" },
            { d: 30, label: "30 days" },
          ].map((t) => (
            <a
              key={t.d}
              href={`/admin?days=${t.d}${fbFilter === "all" ? "&feedback=all" : ""}`}
              className={`sort-tab${days === t.d ? " active" : ""}`}
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>

      {!metrics ? (
        <section className="admin-block">
          <p className="muted">
            DATABASE_URL set nahi hai — traction, feedback aur errors console
            mein ja rahe hain, yahan nahi dikhenge. Neon / Supabase connect
            karke redeploy karo.
          </p>
        </section>
      ) : (
        <>
          <section className="admin-cards">
            <div className="admin-card">
              <span className="n">{metrics.users.total}</span>
              <span className="sub">users</span>
              <span className="delta">+{metrics.users.recent} in {days}d</span>
            </div>
            <div className="admin-card">
              <span className="n">{metrics.searches.window}</span>
              <span className="sub">searches ({days}d)</span>
              <span className="delta">{metrics.searches.total} all-time</span>
            </div>
            <div className="admin-card">
              <span className="n">{metrics.searches.doorToDoor}</span>
              <span className="sub">ghar-se-ghar ({days}d)</span>
              <span className="delta">
                {metrics.searches.window
                  ? Math.round(
                      (metrics.searches.doorToDoor / metrics.searches.window) *
                        100,
                    )
                  : 0}
                % of searches
              </span>
            </div>
            <div className="admin-card">
              <span className="n">{metrics.clicks.window}</span>
              <span className="sub">booking clicks ({days}d)</span>
              <span className="delta">{metrics.clicks.total} all-time</span>
            </div>
            <div className="admin-card">
              <span className="n">{metrics.watches.active}</span>
              <span className="sub">active price alerts</span>
            </div>
            <div className={`admin-card${metrics.feedback.new ? " hot" : ""}`}>
              <span className="n">{metrics.feedback.new}</span>
              <span className="sub">new feedback</span>
              <span className="delta">{metrics.feedback.total} total</span>
            </div>
          </section>

          <section className="admin-block">
            <h2>Last {days} days</h2>
            <div className="admin-bars">
              {metrics.daily.map((d) => (
                <div key={d.day} className="admin-bar">
                  <div className="admin-bar-track">
                    <span
                      className="admin-bar-fill s"
                      style={{ height: `${(d.searches / maxDaily) * 100}%` }}
                      title={`${d.searches} searches`}
                    />
                    <span
                      className="admin-bar-fill c"
                      style={{ height: `${(d.clicks / maxDaily) * 100}%` }}
                      title={`${d.clicks} clicks`}
                    />
                  </div>
                  <span className="admin-bar-label">{d.day}</span>
                </div>
              ))}
            </div>
            <p className="muted admin-legend">
              <span className="dot s" /> searches &nbsp;
              <span className="dot c" /> booking clicks
            </p>
          </section>

          <section className="admin-block">
            <div className="admin-block-head">
              <h2>Feedback inbox</h2>
              <div className="admin-tabs">
                <a
                  href={`/admin?days=${days}`}
                  className={`sort-tab${fbFilter === "new" ? " active" : ""}`}
                >
                  New
                </a>
                <a
                  href={`/admin?days=${days}&feedback=all`}
                  className={`sort-tab${fbFilter === "all" ? " active" : ""}`}
                >
                  All
                </a>
              </div>
            </div>

            {feedback.length === 0 ? (
              <p className="muted">
                {fbFilter === "new"
                  ? "Koi naya feedback nahi 🎉"
                  : "Abhi tak koi feedback nahi aaya."}
              </p>
            ) : (
              <ul className="admin-inbox">
                {feedback.map((f) => (
                  <li key={f.id} className={`fb-row${f.status === "resolved" ? " done" : ""}`}>
                    <div className="fb-row-top">
                      <span className="fb-kind-tag">
                        {KIND_EMOJI[f.kind] ?? "💬"} {f.kind}
                      </span>
                      <span className="muted">{fmt(f.created_at)}</span>
                      {f.status === "resolved" && (
                        <span className="fb-done-tag">resolved</span>
                      )}
                    </div>
                    <p className="fb-msg">{f.message}</p>
                    <div className="fb-row-bot">
                      <span className="muted">
                        {f.email ? (
                          <a href={`mailto:${f.email}`}>{f.email}</a>
                        ) : (
                          "no email"
                        )}
                        {f.page ? ` · ${f.page}` : ""}
                        {f.user_id ? ` · user #${f.user_id}` : ""}
                      </span>
                      {f.status === "resolved" ? (
                        <form action={reopenFeedbackAction}>
                          <input type="hidden" name="id" value={f.id} />
                          <button type="submit" className="chip-btn">
                            Reopen
                          </button>
                        </form>
                      ) : (
                        <form action={resolveFeedbackAction}>
                          <input type="hidden" name="id" value={f.id} />
                          <button type="submit" className="chip-btn">
                            Resolve
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-block">
            <h2>Top routes searched ({days}d)</h2>
            <table className="admin-table">
              <tbody>
                {metrics.topRoutes.length === 0 && (
                  <tr>
                    <td className="muted">abhi koi search nahi</td>
                  </tr>
                )}
                {metrics.topRoutes.map((r) => (
                  <tr key={`${r.from_city}-${r.to_city}`}>
                    <td>
                      {r.from_city} → {r.to_city}
                    </td>
                    <td>{r.searches}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="admin-block">
            <h2>Booking clicks by mode (all-time)</h2>
            <table className="admin-table">
              <tbody>
                {metrics.byMode.length === 0 && (
                  <tr>
                    <td className="muted">abhi koi click nahi</td>
                  </tr>
                )}
                {metrics.byMode.map((r) => (
                  <tr key={r.mode}>
                    <td>{r.mode}</td>
                    <td>{r.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

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

      <section className="admin-block">
        <h2>Recent errors</h2>
        <table className="admin-table">
          <tbody>
            {errors.length === 0 && (
              <tr>
                <td className="muted">koi error nahi 🎉</td>
              </tr>
            )}
            {errors.map((e, i) => (
              <tr key={i}>
                <td>{fmt(e.created_at)}</td>
                <td>{e.path ?? "—"}</td>
                <td className="muted">{e.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">
          Full error monitoring Sentry se aayega (SENTRY_DSN set karo).
        </p>
      </section>
    </main>
  );
}
