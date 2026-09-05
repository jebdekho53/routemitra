"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { listSampleRoutes } from "@/lib/sample-data";
import { STATION_CITIES } from "@/lib/stations";
import { DISTRICTS } from "@/lib/districts";
import type { Mode } from "@/types/route";

const SAMPLE_ROUTES = listSampleRoutes();
// sample-route cities + station cities first (these resolve to real data),
// then every Indian district so any "luc" -> "Lucknow" style lookup works
const CITIES = Array.from(
  new Set([
    ...SAMPLE_ROUTES.flatMap(({ from, to }) => [from, to]),
    ...STATION_CITIES,
    ...DISTRICTS,
  ]),
).sort((a, b) => a.localeCompare(b));

const ALL_MODES: { key: Mode; label: string }[] = [
  { key: "bus", label: "Bus" },
  { key: "train", label: "Train" },
  { key: "flight", label: "Flight" },
];

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
  // which modes to actually fetch — all on by default
  const [modes, setModes] = useState<Set<Mode>>(
    new Set<Mode>(["bus", "train", "flight"]),
  );

  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const [sameCityError, setSameCityError] = useState(false);

  function useMyLocation() {
    setLocateError("");
    if (!("geolocation" in navigator)) {
      setLocateError("Location isn't available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `/api/reverse-geocode?lat=${latitude}&lon=${longitude}`,
          );
          if (!res.ok) throw new Error(String(res.status));
          const json = (await res.json()) as { label?: string };
          if (json.label) setOriginAddr(json.label);
          else setLocateError("Couldn't turn that into an address.");
        } catch {
          setLocateError("Couldn't look up your address. Type it in instead.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — type the address instead."
            : "Couldn't get your location. Type the address instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  function toggleMode(m: Mode) {
    setModes((s) => {
      const next = new Set(s);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      // never let the user deselect everything
      return next.size === 0 ? s : next;
    });
  }

  function go(nextFrom: string, nextTo: string) {
    const f = nextFrom.trim();
    const t = nextTo.trim();
    if (!f || !t) return;
    if (f.toLowerCase() === t.toLowerCase()) {
      setSameCityError(true);
      return;
    }
    setSameCityError(false);
    const qs = new URLSearchParams({ from: f, to: t });
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) qs.set("date", date);
    if (mode === "d2d" && originAddr.trim() && destAddr.trim()) {
      qs.set("origin", originAddr.trim());
      qs.set("destination", destAddr.trim());
    }
    // only pass ?modes= when it's a real subset (all three == default)
    if (modes.size > 0 && modes.size < 3) {
      qs.set(
        "modes",
        ALL_MODES.filter((m) => modes.has(m.key))
          .map((m) => m.key)
          .join(","),
      );
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
          🏠 Door-to-door <span className="sf-beta">beta</span>
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
            <div className="sf-label-row">
              <label htmlFor="origin">Full pickup address</label>
              <button
                type="button"
                className="sf-locate"
                onClick={useMyLocation}
                disabled={locating}
                aria-live="polite"
              >
                {locating ? "Locating…" : "📍 Use my location"}
              </button>
            </div>
            <input
              id="origin"
              name="origin"
              type="text"
              placeholder="e.g. Indirapuram, Ghaziabad"
              required
              value={originAddr}
              onChange={(e) => setOriginAddr(e.target.value)}
            />
            {locateError && <p className="sf-locate-err">{locateError}</p>}
          </div>
        )}

        <div className="sf-route">
          <div className="field">
            <label htmlFor="from">
              {mode === "d2d" ? "From city" : "From"}
            </label>
            <input
              id="from"
              name="from"
              type="text"
              list="cities"
              placeholder="e.g. Pune"
              required
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setSameCityError(false);
              }}
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
              {mode === "d2d" ? "To city" : "To"}
            </label>
            <input
              id="to"
              name="to"
              type="text"
              list="cities"
              placeholder="e.g. Bengaluru"
              required
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setSameCityError(false);
              }}
            />
          </div>
        </div>

        {sameCityError && (
          <p className="sf-error" role="alert">
            From and To can&apos;t be the same place — pick two different
            cities.
          </p>
        )}

        {mode === "d2d" && (
          <div className="field">
            <label htmlFor="destination">Full drop-off address</label>
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

        <fieldset className="sf-modes">
          <legend>Show me</legend>
          {ALL_MODES.map((m) => (
            <label key={m.key} className="sf-mode-check">
              <input
                type="checkbox"
                checked={modes.has(m.key)}
                onChange={() => toggleMode(m.key)}
              />
              {m.label}
            </label>
          ))}
        </fieldset>

        <div className="sf-when">
          <div className="field">
            <label htmlFor="date">Travel date (optional)</label>
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
            Search
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
          Cab + intercity + cab — the total across all three legs. The nearest
          station/airport is picked from your address automatically.
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
