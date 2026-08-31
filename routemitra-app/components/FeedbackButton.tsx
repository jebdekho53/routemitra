"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { feedbackKinds } from "@/lib/validation";

const KIND_LABEL: Record<string, string> = {
  idea: "💡 Idea",
  bug: "🐞 Kuch toota",
  fare: "₹ Fare galat",
  support: "🙋 Help chahiye",
  other: "💬 Aur kuch",
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
      setErrMsg("Thoda detail likho.");
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
            (j.errors && Object.values(j.errors)[0] as string) ||
            "Kuch galat ho gaya.",
        );
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrMsg("Network problem — dobara try karo.");
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
          <b id={`${formId}-title`}>Feedback bhejo</b>
          <button
            type="button"
            className="feedback-close"
            aria-label="Band karo"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        {status === "sent" ? (
          <div className="feedback-sent">
            <p>Mil gaya — shukriya! 🙏</p>
            <p className="muted">
              Zaroorat padi to{" "}
              {email.trim() ? "isi email par" : "reply nahi kar paayenge (email nahi diya)"}
              .
            </p>
            <button
              type="button"
              className="go-btn"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Theek hai
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
              Kya kehna hai?
            </label>
            <textarea
              id={`${formId}-msg`}
              className="fb-textarea"
              rows={4}
              maxLength={4000}
              placeholder="Jo bhi acha / bura / missing laga…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <label htmlFor={`${formId}-email`} className="fb-label">
              Email <span className="muted">(optional — reply ke liye)</span>
            </label>
            <input
              id={`${formId}-email`}
              className="fb-input"
              type="email"
              autoComplete="email"
              placeholder="tumhara@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {status === "error" && <p className="auth-error">{errMsg}</p>}

            <button
              type="submit"
              className="go-btn"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Bhej rahe hain…" : "Bhejo"}
            </button>
            <p className="fb-fineprint muted">
              Privacy / data complaint ke liye{" "}
              <a href="/contact">Contact page</a> use karo.
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
        aria-label="Feedback bhejo"
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
