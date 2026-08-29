"use client";

import { useState } from "react";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return (
      <p className="auth-ok">
        Agar ye email registered hai to reset link bhej diya gaya hai. Inbox
        (aur spam) check karo.
      </p>
    );
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit" className="go-btn" disabled={busy}>
        {busy ? "..." : "Reset link bhejo"}
      </button>
    </form>
  );
}
