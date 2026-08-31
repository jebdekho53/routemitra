"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "support", label: "General help" },
  { value: "bug", label: "Something is broken" },
  { value: "fare", label: "Fare / result looks wrong" },
  { value: "idea", label: "Feature idea / feedback" },
  { value: "other", label: "Other" },
];

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [kind, setKind] = useState("support");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 4) {
      setStatus("error");
      setErr("Thoda detail likho.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          email: email.trim(),
          message: message.trim(),
          page: "/contact",
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setStatus("error");
        setErr(
          j.error ||
            ((j.errors && Object.values(j.errors)[0]) as string) ||
            "Bhej nahi paaye — thodi der baad try karo.",
        );
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setErr("Network problem — dobara try karo.");
    }
  }

  if (status === "sent") {
    return (
      <div className="auth-form">
        <h2>Mil gaya ✅</h2>
        <p className="auth-hint">
          Message pahunch gaya.{" "}
          {email.trim()
            ? `Zaroorat padi to ${email.trim()} par reply karenge.`
            : "Email nahi diya, isliye reply nahi kar paayenge — chaahe to niche dobara email ke saath bhej do."}
        </p>
        <button
          type="button"
          className="go-btn"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
        >
          Ek aur bhejo
        </button>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <h2>Message bhejo</h2>
      {status === "error" && <p className="auth-error">{err}</p>}

      <div className="field">
        <label htmlFor="c-kind">Kis baare mein?</label>
        <select
          id="c-kind"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="c-email">Email (reply ke liye)</label>
        <input
          id="c-email"
          type="email"
          autoComplete="email"
          placeholder="tumhara@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="c-msg">Message</label>
        <textarea
          id="c-msg"
          className="fb-textarea"
          rows={6}
          maxLength={4000}
          placeholder="Jitna detail doge, utni jaldi help kar paayenge. Route, screenshot ka description, jo dikha vs jo expect kiya…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="go-btn" disabled={status === "sending"}>
        {status === "sending" ? "Bhej rahe hain…" : "Bhejo"}
      </button>
    </form>
  );
}
