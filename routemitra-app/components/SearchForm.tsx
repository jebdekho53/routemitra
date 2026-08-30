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

type SearchMode = "city" | "d2d";

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
  const [mode, setMode] = useState<SearchMode>(
    initialOrigin || initialDestination ? "d2d" : "city",
  );

  function go(nextFrom: string, nextTo: string) {
    const f = nextFrom.trim();
    const t = nextTo.trim();
    if (!f || !t) return;
    const qs = new URLSearchParams({ from: f, to: t });
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) qs.set("date", date);
    if (mode === "d2d" && originAddr.trim() && destAddr.trim()) {
      qs.set("origin", originAddr.trim());
      qs.set("destination", destAddr.trim());
    }
    router.push(`/search?${qs.toString()}`);
  }

  return (
    <section className="search-card">
      <div className="sf-mode" role="tablist" aria-label="Search type">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "city"}
          className={`sf-mode-tab${mode === "city" ? " active" : ""}`}
          onClick={() => setMode("city")}
        >
          City to city
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "d2d"}
          className={`sf-mode-tab${mode === "d2d" ? " active" : ""}`}
          onClick={() => setMode("d2d")}
        >
          🏠 Ghar-se-ghar <span className="sf-beta">beta</span>
        </button>
      </div>

      <form
        id="search-form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          go(from, to);
        }}
      >
        {mode === "d2d" && (
          <div className="field">
            <label htmlFor="origin">Ghar ka poora address</label>
            <input
              id="origin"
              name="origin"
              type="text"
              placeholder="e.g. Indirapuram, Ghaziabad"
              required
              value={originAddr}
              onChange={(e) => setOriginAddr(e.target.value)}
            />
          </div>
        )}

        <div className="sf-route">
          <div className="field">
            <label htmlFor="from">
              {mode === "d2d" ? "Kaunsi city se" : "Kahan se"}
            </label>
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
              if (mode === "d2d") {
                setOriginAddr(destAddr);
                setDestAddr(originAddr);
              }
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
            <label htmlFor="to">
              {mode === "d2d" ? "Kaunsi city tak" : "Kahan tak"}
            </label>
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

        {mode === "d2d" && (
          <div className="field">
            <label htmlFor="destination">Pahunchne ka poora address</label>
            <input
              id="destination"
              name="destination"
              type="text"
              placeholder="e.g. Lanka, Varanasi"
              required
              value={destAddr}
              onChange={(e) => setDestAddr(e.target.value)}
            />
          </div>
        )}

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

      {mode === "d2d" && (
        <p className="sf-mode-hint">
          Cab + intercity + cab — teeno legs ka total. Address se nearest
          station/airport khud chun liya jaata hai.
        </p>
      )}

      <div className="examples">
        {SAMPLE_ROUTES.slice(0, 8).map(({ from: f, to: t }) => (
          <button
            key={`${f}-${t}`}
            type="button"
            className="example-chip"
            onClick={() => {
              setFrom(f);
              setTo(t);
              if (mode === "city") go(f, t);
            }}
          >
            {f} → {t}
          </button>
        ))}
      </div>
    </section>
  );
}
