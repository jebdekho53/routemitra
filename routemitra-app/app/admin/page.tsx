import Link from "next/link";
import { adminMetrics } from "@/lib/metrics";
import { listFeedback } from "@/lib/feedback";
import { DailyBars, WindowTabs, parseDays, AdminEmpty } from "./_ui";
import FeedbackList from "./_FeedbackList";

export const dynamic = "force-dynamic";

export default async function AdminOverview({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const days = parseDays((await searchParams).days);
  const [m, recentFeedback] = await Promise.all([
    adminMetrics(days),
    listFeedback("new", 5),
  ]);

  if (!m) {
    return (
      <>
        <header className="admin-page-head">
          <h1>Overview</h1>
        </header>
        <AdminEmpty>
          DATABASE_URL set nahi hai — traction, feedback aur errors console mein
          ja rahe hain. Neon / Supabase connect karke redeploy karo.
        </AdminEmpty>
      </>
    );
  }

  const d2dPct = m.searches.window
    ? Math.round((m.searches.doorToDoor / m.searches.window) * 100)
    : 0;

  return (
    <>
      <header className="admin-page-head">
        <h1>Overview</h1>
        <WindowTabs base="/admin" days={days} />
      </header>

      <section className="admin-cards">
        <Link href="/admin/users" className="admin-card">
          <span className="n">{m.users.total}</span>
          <span className="sub">users</span>
          <span className="delta">+{m.users.recent} in {days}d</span>
        </Link>
        <Link href="/admin/traffic" className="admin-card">
          <span className="n">{m.searches.window}</span>
          <span className="sub">searches ({days}d)</span>
          <span className="delta">{m.searches.total} all-time</span>
        </Link>
        <Link href="/admin/traffic" className="admin-card">
          <span className="n">{d2dPct}%</span>
          <span className="sub">ghar-se-ghar</span>
          <span className="delta">{m.searches.doorToDoor} of {m.searches.window}</span>
        </Link>
        <Link href="/admin/traffic" className="admin-card">
          <span className="n">{m.clicks.window}</span>
          <span className="sub">booking clicks ({days}d)</span>
          <span className="delta">{m.clicks.total} all-time</span>
        </Link>
        <Link href="/admin/users" className="admin-card">
          <span className="n">{m.watches.active}</span>
          <span className="sub">active price alerts</span>
        </Link>
        <Link
          href="/admin/feedback"
          className={`admin-card${m.feedback.new ? " hot" : ""}`}
        >
          <span className="n">{m.feedback.new}</span>
          <span className="sub">new feedback</span>
          <span className="delta">{m.feedback.total} total</span>
        </Link>
      </section>

      <section className="admin-block">
        <h2>Last {days} days</h2>
        <DailyBars daily={m.daily} />
      </section>

      <section className="admin-block">
        <div className="admin-block-head">
          <h2>Newest feedback</h2>
          <Link href="/admin/feedback" className="admin-link">
            Open inbox →
          </Link>
        </div>
        <FeedbackList rows={recentFeedback} />
      </section>

      <section className="admin-block">
        <div className="admin-block-head">
          <h2>Top routes ({days}d)</h2>
          <Link href="/admin/traffic" className="admin-link">
            All traffic →
          </Link>
        </div>
        <table className="admin-table">
          <tbody>
            {m.topRoutes.length === 0 && (
              <tr>
                <td className="muted">abhi koi search nahi</td>
              </tr>
            )}
            {m.topRoutes.slice(0, 6).map((r) => (
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
    </>
  );
}
