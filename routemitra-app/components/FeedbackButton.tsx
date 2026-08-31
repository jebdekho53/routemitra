"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { feedbackKinds } from "@/lib/validation";

const KIND_LABEL: Record<string, string> = {
  idea: "💡 Idea",
  bug: "🐞 Something broke",
  fare: "₹ Fare looks wrong",
  support: "🙋 Need help",
  other: "💬 Something else",
};

type Status = "idle" | "sending" | "sent" | "error";

export default function FeedbackButton() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string>("idea");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");
  const formId = useId();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // don't show the widget on top of the admin dashboard
  if (pathname?.startsWith("/admin")) return null;

  function reset() {
    setKind("idea");
    setMessage("");
    setEmail("");
    setStatus("idle");
    setErrMsg("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 4) {
      setStatus("error");
      setErrMsg("Please add a little more detail.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          message: message.trim(),
          email: email.trim(),
          page: pathname ?? undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setStatus("error");
        setErrMsg(
          j.error ||
            ((j.errors && Object.values(j.errors)[0]) as string) ||
            "Something went wrong.",
        );
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrMsg("Network problem — please try again.");
    }
  }

  const panel = (
    <div
      className="feedback-scrim"
      onClick={() => {
        setOpen(false);
      }}
    >
      <div
        className="feedback-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="feedback-head">
          <b id={`${formId}-title`}>Send feedback</b>
          <button
            type="button"
            className="feedback-close"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        {status === "sent" ? (
          <div className="feedback-sent">
            <p>Got it — thank you! 🙏</p>
            <p className="muted">
              {email.trim()
                ? "We'll reply at that email if needed."
                : "We can't reply (no email given)."}
            </p>
            <button
              type="button"
              className="go-btn"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={submit}>
            <div className="fb-kinds" role="group" aria-label="Type">
              {feedbackKinds.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`fb-kind${kind === k ? " active" : ""}`}
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                >
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>

            <label htmlFor={`${formId}-msg`} className="fb-label">
              What would you like to tell us?
            </label>
            <textarea
              id={`${formId}-msg`}
              className="fb-textarea"
              rows={4}
              maxLength={4000}
              placeholder="Anything that felt good, broken, or missing…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <label htmlFor={`${formId}-email`} className="fb-label">
              Email <span className="muted">(optional — for a reply)</span>
            </label>
            <input
              id={`${formId}-email`}
              className="fb-input"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {status === "error" && <p className="auth-error">{errMsg}</p>}

            <button
              type="submit"
              className="go-btn"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send"}
            </button>
            <p className="fb-fineprint muted">
              For a privacy / data complaint, use the{" "}
              <a href="/contact">Contact page</a>.
            </p>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="feedback-fab"
        aria-label="Send feedback"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden>💬</span>
        <span className="feedback-fab-text">Feedback</span>
      </button>
      {mounted && open && createPortal(panel, document.body)}
    </>
  );
}
