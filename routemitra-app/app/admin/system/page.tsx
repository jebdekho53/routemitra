import type { Metadata } from "next";
import { integrationStatus } from "@/lib/status";
import { recentErrors } from "@/lib/metrics";
import { fmtDateTime } from "../_ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "System" };

export default async function AdminSystem() {
  const status = integrationStatus();
  const errors = await recentErrors(30);
  const liveCount = status.filter((s) => s.live).length;

  return (
    <>
      <header className="admin-page-head">
        <h1>System</h1>
        <span className="muted">
          {liveCount}/{status.length} integrations live
        </span>
      </header>

      <section className="admin-block">
        <h2>Integrations</h2>
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
                <td className="muted">no errors 🎉</td>
              </tr>
            )}
            {errors.map((e, i) => (
              <tr key={i}>
                <td>{fmtDateTime(e.created_at)}</td>
                <td>{e.path ?? "—"}</td>
                <td className="muted">{e.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">
          Client-side and full stack traces will come from Sentry once SENTRY_DSN
          is set. For now only server errors are captured in the `errors` table.
        </p>
      </section>
    </>
  );
}
