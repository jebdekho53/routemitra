// Shared bits for the admin sub-pages (server components only).

export function fmtDateTime(ts: string): string {
  return new Date(ts).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function fmtDate(ts: string): string {
  return new Date(ts).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

export function AdminEmpty({ children }: { children: React.ReactNode }) {
  return (
    <section className="admin-block">
      <p className="muted">{children}</p>
    </section>
  );
}

/** Simple two-series day bars (searches vs clicks). */
export function DailyBars({
  daily,
}: {
  daily: { day: string; searches: number; clicks: number }[];
}) {
  const max = Math.max(1, ...daily.map((d) => Math.max(d.searches, d.clicks)));
  return (
    <>
      <div className="admin-bars">
        {daily.map((d) => (
          <div key={d.day} className="admin-bar">
            <div className="admin-bar-track">
              <span
                className="admin-bar-fill s"
                style={{ height: `${(d.searches / max) * 100}%` }}
                title={`${d.searches} searches`}
              />
              <span
                className="admin-bar-fill c"
                style={{ height: `${(d.clicks / max) * 100}%` }}
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
    </>
  );
}

export function WindowTabs({
  base,
  days,
  extra = "",
}: {
  base: string;
  days: number;
  extra?: string;
}) {
  const opts = [
    { d: 1, label: "24h" },
    { d: 7, label: "7 days" },
    { d: 30, label: "30 days" },
  ];
  return (
    <div className="admin-tabs" aria-label="Time window">
      {opts.map((t) => (
        <a
          key={t.d}
          href={`${base}?days=${t.d}${extra}`}
          className={`sort-tab${days === t.d ? " active" : ""}`}
        >
          {t.label}
        </a>
      ))}
    </div>
  );
}

export function parseDays(v: string | undefined): 1 | 7 | 30 {
  return v === "1" ? 1 : v === "30" ? 30 : 7;
}
