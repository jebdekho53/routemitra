import type { FeedbackRow } from "@/lib/feedback";
import { resolveFeedbackAction, reopenFeedbackAction } from "./actions";
import { fmtDateTime } from "./_ui";

const KIND_EMOJI: Record<string, string> = {
  idea: "💡",
  bug: "🐞",
  fare: "₹",
  support: "🙋",
  other: "💬",
};

export default function FeedbackList({ rows }: { rows: FeedbackRow[] }) {
  if (rows.length === 0) {
    return <p className="muted">Nothing here 🎉</p>;
  }
  return (
    <ul className="admin-inbox">
      {rows.map((f) => (
        <li
          key={f.id}
          className={`fb-row${f.status === "resolved" ? " done" : ""}`}
        >
          <div className="fb-row-top">
            <span className="fb-kind-tag">
              {KIND_EMOJI[f.kind] ?? "💬"} {f.kind}
            </span>
            <span className="muted">{fmtDateTime(f.created_at)}</span>
            {f.status === "resolved" && (
              <span className="fb-done-tag">resolved</span>
            )}
          </div>
          <p className="fb-msg">{f.message}</p>
          <div className="fb-row-bot">
            <span className="muted">
              {f.email ? <a href={`mailto:${f.email}`}>{f.email}</a> : "no email"}
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
  );
}
