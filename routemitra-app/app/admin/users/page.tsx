import type { Metadata } from "next";
import { userStats } from "@/lib/metrics";
import { AdminEmpty, fmtDate } from "../_ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Users" };

export default async function AdminUsers() {
  const u = await userStats(7);

  if (!u) {
    return (
      <>
        <header className="admin-page-head">
          <h1>Users</h1>
        </header>
        <AdminEmpty>DATABASE_URL set nahi hai — accounts disabled.</AdminEmpty>
      </>
    );
  }

  return (
    <>
      <header className="admin-page-head">
        <h1>Users</h1>
      </header>

      <section className="admin-cards">
        <div className="admin-card">
          <span className="n">{u.total}</span>
          <span className="sub">total users</span>
          <span className="delta">+{u.recent} in 7d</span>
        </div>
        <div className="admin-card">
          <span className="n">{u.verified}</span>
          <span className="sub">email verified</span>
          <span className="delta">
            {u.total ? Math.round((u.verified / u.total) * 100) : 0}%
          </span>
        </div>
        <div className="admin-card">
          <span className="n">{u.oauth}</span>
          <span className="sub">Google sign-in</span>
        </div>
        <div className="admin-card">
          <span className="n">{u.watchesActive}</span>
          <span className="sub">active price alerts</span>
          <span className="delta">{u.watchesTotal} total</span>
        </div>
        <div className="admin-card">
          <span className="n">{u.savedSearches}</span>
          <span className="sub">saved searches</span>
        </div>
      </section>

      <section className="admin-block">
        <h2>Recent signups</h2>
        <table className="admin-table">
          <tbody>
            {u.recentUsers.length === 0 && (
              <tr>
                <td className="muted">abhi koi user nahi</td>
              </tr>
            )}
            {u.recentUsers.map((row) => (
              <tr key={row.id}>
                <td>{fmtDate(row.created_at)}</td>
                <td>{row.name ?? "—"}</td>
                <td className="muted">{row.email}</td>
                <td>
                  {row.oauth_provider
                    ? row.oauth_provider
                    : row.email_verified_at
                      ? "verified"
                      : "unverified"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {u.recentUsers.length === 40 && (
          <p className="muted">Latest 40 dikhaye jaa rahe hain.</p>
        )}
      </section>
    </>
  );
}
