"use client";

import { useState } from "react";
import Link from "next/link";
import type { RouteWatch, Favourite } from "@/lib/user-data";

function searchHref(from: string, to: string) {
  return `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
}

export function WatchList({ initial }: { initial: RouteWatch[] }) {
  const [watches, setWatches] = useState(initial);
  async function remove(id: string) {
    if (await fetch(`/api/watches?id=${id}`, { method: "DELETE" }).then((r) => r.ok)) {
      setWatches((w) => w.filter((x) => x.id !== id));
    }
  }
  if (watches.length === 0)
    return <p className="muted">No routes watched yet.</p>;
  return (
    <ul className="dash-list">
      {watches.map((w) => (
        <li key={w.id}>
          <Link href={searchHref(w.from_city, w.to_city)}>
            {w.from_city} → {w.to_city}
          </Link>
          {w.last_price != null && (
            <span className="muted"> · last ₹{w.last_price}</span>
          )}
          <button type="button" className="link-x" onClick={() => remove(w.id)}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}

export function FavouriteList({ initial }: { initial: Favourite[] }) {
  const [favs, setFavs] = useState(initial);
  async function remove(id: string) {
    if (
      await fetch(`/api/favourites?id=${id}`, { method: "DELETE" }).then(
        (r) => r.ok,
      )
    ) {
      setFavs((f) => f.filter((x) => x.id !== id));
    }
  }
  if (favs.length === 0)
    return <p className="muted">No favourite routes yet.</p>;
  return (
    <ul className="dash-list">
      {favs.map((f) => (
        <li key={f.id}>
          <Link href={searchHref(f.from_city, f.to_city)}>
            {f.from_city} → {f.to_city}
          </Link>
          <button type="button" className="link-x" onClick={() => remove(f.id)}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
