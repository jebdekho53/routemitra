"use client";

import { useState } from "react";
import Link from "next/link";
import Turnstile from "@/components/auth/Turnstile";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setErrors({});
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        turnstileToken: captcha,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setDone(true);
      return;
    }
    const body = await res.json().catch(() => ({}));
    if (body.errors) setErrors(body.errors);
    else setError(body.error || "Kuch gadbad ho gayi.");
  }

  if (done) {
    return (
      <p className="auth-ok">
        Account ban gaya! Tumhare email par ek verification link bheja hai — use
        kholo, phir <Link href="/login">login</Link> karo.
        <br />
        <span className="auth-hint">
          (Email provider set nahi hai to link server console mein print hoga.)
        </span>
      </p>
    );
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      {error && <p className="auth-error">{error}</p>}
      <div className="field">
        <label htmlFor="name">Naam</label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>
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
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>
      <div className="field">
        <label htmlFor="password">Password (min 8)</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
          <span className="field-error">{errors.password}</span>
        )}
      </div>
      <Turnstile onToken={setCaptcha} />
      <button type="submit" className="go-btn" disabled={busy}>
        {busy ? "..." : "Account banao"}
      </button>
    </form>
  );
}
