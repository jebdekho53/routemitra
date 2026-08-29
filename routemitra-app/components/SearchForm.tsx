"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { listSampleRoutes } from "@/lib/sample-data";

const SAMPLE_ROUTES = listSampleRoutes();
const CITIES = Array.from(
  new Set(SAMPLE_ROUTES.flatMap(({ from, to }) => [from, to])),
);

export default function SearchForm({
  initialFrom = "",
  initialTo = "",
}: {
  initialFrom?: string;
  initialTo?: string;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  function go(nextFrom: string, nextTo: string) {
    const f = nextFrom.trim();
    const t = nextTo.trim();
    if (!f || !t) return;
    const qs = new URLSearchParams({ from: f, to: t });
    router.push(`/search?${qs.toString()}`);
  }

  return (
    <section className="search-card">
      <form
        id="search-form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          go(from, to);
        }}
      >
        <div className="field">
          <label htmlFor="from">Kahan se</label>
          <input
            id="from"
            name="from"
            type="text"
            list="cities"
            placeholder="e.g. Pune"
            required
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div
          className="swap"
          role="button"
          tabIndex={0}
          title="Swap"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFrom(to);
              setTo(from);
            }
          }}
        >
          ⇄
        </div>
        <div className="field">
          <label htmlFor="to">Kahan tak</label>
          <input
            id="to"
            name="to"
            type="text"
            list="cities"
            placeholder="e.g. Bengaluru"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <datalist id="cities">
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button type="submit" className="go-btn">
          Dhoondo
        </button>
      </form>

      <div className="examples">
        {SAMPLE_ROUTES.map(({ from: f, to: t }) => (
          <button
            key={`${f}-${t}`}
            type="button"
            className="example-chip"
            onClick={() => {
              setFrom(f);
              setTo(t);
              go(f, t);
            }}
          >
            {f} → {t}
          </button>
        ))}
      </div>
    </section>
  );
}
