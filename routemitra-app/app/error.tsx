"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Phase 15 wires Sentry here; until then, ship a minimal beacon so the
    // /admin dashboard can show recent errors.
    console.error("[app error]", error);
    try {
      const payload = JSON.stringify({
        message: error.message,
        digest: error.digest,
        path: typeof window !== "undefined" ? window.location.pathname : null,
      });
      navigator.sendBeacon?.(
        "/api/client-error",
        new Blob([payload], { type: "application/json" }),
      );
    } catch {
      // never let error reporting throw
    }
  }, [error]);

  return (
    <main className="wrap">
      <section className="state-card">
        <p className="state-code">500</p>
        <p>Kuch gadbad ho gayi. Thodi der baad dobara try karo.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 8 }}>
          <button type="button" className="go-btn" onClick={() => reset()}>
            Dobara try karo
          </button>
          <Link href="/" className="book-btn">
            Home
          </Link>
        </div>
        {error.digest && (
          <p className="state-digest">Ref: {error.digest}</p>
        )}
      </section>
    </main>
  );
}
