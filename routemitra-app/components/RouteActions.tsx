"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// "Watch price" + "Save route" for the current from/to. Logged-out users get
// a login nudge instead.
export default function RouteActions({
  from,
  to,
  cheapestPrice,
}: {
  from: string;
  to: string;
  cheapestPrice?: number;
}) {
  const { data: session, status } = useSession();
  const [watched, setWatched] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState<"" | "watch" | "save">("");

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <p className="route-actions muted">
        <Link href={`/login?callbackUrl=/search?from=${encodeURIComponent(from)}%26to=${encodeURIComponent(to)}`}>
          Login
        </Link>{" "}
        karo is route ko watch ya save karne ke liye.
      </p>
    );
  }

  async function post(path: string, extra: Record<string, unknown> = {}) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, ...extra }),
    });
    return res.ok;
  }

  return (
    <div className="route-actions">
      <button
        type="button"
        className="chip-btn"
        disabled={busy !== "" || watched}
        onClick={async () => {
          setBusy("watch");
          if (await post("/api/watches", { price: cheapestPrice })) setWatched(true);
          setBusy("");
        }}
      >
        {watched ? "✓ Watching" : "🔔 Watch price"}
      </button>
      <button
        type="button"
        className="chip-btn"
        disabled={busy !== "" || saved}
        onClick={async () => {
          setBusy("save");
          if (await post("/api/favourites")) setSaved(true);
          setBusy("");
        }}
      >
        {saved ? "✓ Saved" : "☆ Save route"}
      </button>
    </div>
  );
}
