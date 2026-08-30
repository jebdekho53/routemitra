"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { listSampleRoutes } from "@/lib/sample-data";

const SAMPLE_ROUTES = listSampleRoutes();
const CITIES = Array.from(
  new Set(SAMPLE_ROUTES.flatMap(({ from, to }) => [from, to])),
);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SearchForm({
  initialFrom = "",
  initialTo = "",
  initialDate = "",
  initialOrigin = "",
  initialDestination = "",
}: {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialOrigin?: string;
  initialDestination?: string;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState(initialDate);
  const [originAddr, setOriginAddr] = useState(initialOrigin);
  const [destAddr, setDestAddr] = useState(initialDestination);
  const [showD2d, setShowD2d] = useState(
    Boolean(initialOrigin || initialDestination),
  );

  function go(nextFrom: string, nextTo: string) {
    const f = nextFrom.trim();
    const t = nextTo.trim();
    if (!f || !t) return;
    const qs = new URLSearchParams({ from: f, to: t });
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) qs.set("date", date);
    if (showD2d && originAddr.trim() && destAddr.trim()) {
      qs.set("origin", originAddr.trim());
      qs.set("destination", destAddr.trim());
    }
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
        <div className="sf-route">
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
        </div>

        <div className="sf-when">
          <div className="field">
            <label htmlFor="date">Kab jaana hai (optional)</label>
            <input
              id="date"
              name="date"
              type="date"
              min={todayISO()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button type="submit" className="go-btn">
            Dhoondo
          </button>
        </div>

        <datalist id="cities">
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </form>

      <button
        type="button"
        className="d2d-toggle"
        onClick={() => setShowD2d((v) => !v)}
        aria-expanded={showD2d}
      >
        {showD2d ? "− " : "+ "}Ghar-se-ghar fare (beta)
      </button>

      {showD2d && (
        <div className="d2d-fields">
          <div className="field">
            <label htmlFor="origin">Ghar ka address</label>
            <input
              id="origin"
              type="text"
              placeholder="e.g. Indirapuram, Ghaziabad"
              value={originAddr}
              onChange={(e) => setOriginAddr(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="destination">Final address</label>
            <input
              id="destination"
              type="text"
              placeholder="e.g. Lanka, Varanasi"
              value={destAddr}
              onChange={(e) => setDestAddr(e.target.value)}
            />
          </div>
        </div>
      )}

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
