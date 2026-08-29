"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetForm() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setBusy(false);
    if (res.ok) {
      setDone(true);
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error || body.errors?.password || "Reset fail ho gaya.");
  }

  if (!token) {
    return <p className="auth-error">Reset link adhoora hai.</p>;
  }
  if (done) {
    return (
      <p className="auth-ok">
        Password badal gaya. Ab <Link href="/login">login</Link> karo.
      </p>
    );
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      {error && <p className="auth-error">{error}</p>}
      <div className="field">
        <label htmlFor="password">Naya password (min 8)</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" className="go-btn" disabled={busy}>
        {busy ? "..." : "Password set karo"}
      </button>
    </form>
  );
}
