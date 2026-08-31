import type { Metadata } from "next";
import { trafficStats } from "@/lib/metrics";
import { DailyBars, WindowTabs, parseDays, AdminEmpty, fmtDateTime } from "../_ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Traffic" };

export default async function AdminTraffic({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const days = parseDays((await searchParams).days);
  const t = await trafficStats(days);

  if (!t) {
    return (
      <>
        <header className="admin-page-head">
          <h1>Traffic</h1>
        </header>
        <AdminEmpty>
          DATABASE_URL set nahi hai — search / click volume record nahi ho raha.
        </AdminEmpty>
      </>
    );
  }

  const d2dPct = t.searchWindow
    ? Math.round((t.doorToDoor / t.searchWindow) * 100)
    : 0;

  return (
    <>
      <header className="admin-page-head">
        <h1>Traffic</h1>
        <WindowTabs base="/admin/traffic" days={days} />
      </header>

      <section className="admin-cards">
        <div className="admin-card">
          <span className="n">{t.searchWindow}</span>
          <span className="sub">searches ({days}d)</span>
          <span className="delta">{t.searchTotal} all-time</span>
        </div>
        <div className="admin-card">
          <span className="n">{d2dPct}%</span>
          <span className="sub">ghar-se-ghar</span>
          <span className="delta">{t.doorToDoor} of {t.searchWindow}</span>
        </div>
        <div className="admin-card">
          <span className="n">{t.clickWindow}</span>
          <span className="sub">booking clicks ({days}d)</span>
          <span className="delta">{t.clickTotal} all-time</span>
        </div>
        <div className="admin-card">
          <span className="n">
            {t.searchWindow
              ? Math.round((t.clickWindow / t.searchWindow) * 100)
              : 0}
            %
          </span>
          <span className="sub">search → click</span>
        </div>
      </section>

      <section className="admin-block">
        <h2>Last {days} days</h2>
        <DailyBars daily={t.daily} />
      </section>

      <div className="admin-two-col">
        <section className="admin-block">
          <h2>Top routes searched ({days}d)</h2>
          <table className="admin-table">
            <tbody>
              {t.topRoutes.length === 0 && (
                <tr>
                  <td className="muted">abhi koi search nahi</td>
                </tr>
              )}
              {t.topRoutes.map((r) => (
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
          <h2>Booking clicks by mode</h2>
          <table className="admin-table">
            <tbody>
              {t.byMode.length === 0 && (
                <tr>
                  <td className="muted">abhi koi click nahi</td>
                </tr>
              )}
              {t.byMode.map((r) => (
                <tr key={r.mode}>
                  <td>{r.mode}</td>
                  <td>{r.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="admin-block">
        <h2>Recent booking clicks</h2>
        <table className="admin-table">
          <tbody>
            {t.recentClicks.length === 0 && (
              <tr>
                <td className="muted">abhi koi click nahi</td>
              </tr>
            )}
            {t.recentClicks.map((c, i) => (
              <tr key={i}>
                <td>{fmtDateTime(c.created_at)}</td>
                <td>{c.mode}</td>
                <td>
                  {c.operator}
                  {c.indicative ? " (est.)" : ""}
                </td>
                <td>
                  {c.from_city} → {c.to_city}
                </td>
                <td>{c.price != null ? `₹${c.price}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
