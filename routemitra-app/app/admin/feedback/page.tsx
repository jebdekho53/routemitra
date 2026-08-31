import type { Metadata } from "next";
import { listFeedback, feedbackCounts } from "@/lib/feedback";
import FeedbackList from "../_FeedbackList";
import { AdminEmpty } from "../_ui";
import { dbEnabled } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Feedback" };

type Filter = "new" | "resolved" | "all";

export default async function AdminFeedback({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const raw = (await searchParams).status;
  const filter: Filter =
    raw === "resolved" ? "resolved" : raw === "all" ? "all" : "new";

  if (!dbEnabled) {
    return (
      <>
        <header className="admin-page-head">
          <h1>Feedback</h1>
        </header>
        <AdminEmpty>
          DATABASE_URL is not set — feedback is printed to the console and not
          stored here.
        </AdminEmpty>
      </>
    );
  }

  const [rows, counts] = await Promise.all([
    listFeedback(filter, 100),
    feedbackCounts(),
  ]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "new", label: `New (${counts.new})` },
    { key: "resolved", label: `Resolved (${counts.total - counts.new})` },
    { key: "all", label: `All (${counts.total})` },
  ];

  return (
    <>
      <header className="admin-page-head">
        <h1>Feedback</h1>
        <div className="admin-tabs">
          {tabs.map((t) => (
            <a
              key={t.key}
              href={`/admin/feedback${t.key === "new" ? "" : `?status=${t.key}`}`}
              className={`sort-tab${filter === t.key ? " active" : ""}`}
            >
              {t.label}
            </a>
          ))}
        </div>
      </header>

      <section className="admin-block">
        <FeedbackList rows={rows} />
        {rows.length === 100 && (
          <p className="muted">Showing the latest 100 only.</p>
        )}
      </section>
    </>
  );
}
