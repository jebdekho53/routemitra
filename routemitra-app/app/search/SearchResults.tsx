"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { RouteResult, RouteOption, SortKey, Mode } from "@/types/route";
import { listSampleRoutes } from "@/lib/sample-data";
import { formatDuration, formatPrice } from "@/lib/format";
import { computeMeta, tagsFor } from "@/lib/result-meta";
import ResultCard from "@/components/ResultCard";
import SortTabs from "@/components/SortTabs";
import TimeFilter from "@/components/TimeFilter";
import { bucketOf } from "@/lib/time-buckets";
import SearchForm from "@/components/SearchForm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RouteActions from "@/components/RouteActions";
import HotelCta from "@/components/HotelCta";
import TripExtras from "@/components/TripExtras";

type Status = "loading" | "results" | "empty" | "error";

const SAMPLE_ROUTES = listSampleRoutes();

type Fetched =
  | { key: string; data: RouteResult }
  | { key: string; error: true };

export default function SearchResults() {
  const params = useSearchParams();
  const from = params.get("from")?.trim() ?? "";
  const to = params.get("to")?.trim() ?? "";
  const date = params.get("date");
  const origin = params.get("origin")?.trim() ?? "";
  const destination = params.get("destination")?.trim() ?? "";

  const queryKey = from && to
    ? `${from}|${to}|${date ?? ""}|${origin}|${destination}`
    : null;

  const [fetched, setFetched] = useState<Fetched | null>(null);
  const [sort, setSort] = useState<SortKey>("price");
  const [modeFilter, setModeFilter] = useState<Mode | "all">("all");
  const [depBuckets, setDepBuckets] = useState<Set<number>>(new Set());
  const [arrBuckets, setArrBuckets] = useState<Set<number>>(new Set());

  // reset every filter when the route/date changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModeFilter("all");
    setDepBuckets(new Set());
    setArrBuckets(new Set());
  }, [queryKey]);

  const toggleBucket = (
    setFn: (fn: (s: Set<number>) => Set<number>) => void,
    id: number,
  ) =>
    setFn((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useEffect(() => {
    if (!queryKey) return;

    const qs = new URLSearchParams({ from, to });
    if (date) qs.set("date", date);
    if (origin && destination) {
      qs.set("origin", origin);
      qs.set("destination", destination);
    }

    let cancelled = false;
    fetch(`/api/search?${qs.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<RouteResult>;
      })
      .then((json) => {
        if (!cancelled) setFetched({ key: queryKey, data: json });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key: queryKey, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [queryKey, from, to, date, origin, destination]);

  const current = fetched && fetched.key === queryKey ? fetched : null;
  const data = current && "data" in current ? current.data : null;

  const status: Status = !queryKey
    ? "empty"
    : !current
      ? "loading"
      : "error" in current
        ? "error"
        : data && data.options.length > 0
          ? "results"
          : "empty";

  const allOptions = useMemo(() => data?.options ?? [], [data]);

  const modeCounts = useMemo(() => {
    const c: Record<string, number> = { all: allOptions.length };
    for (const o of allOptions) c[o.mode] = (c[o.mode] ?? 0) + 1;
    return c;
  }, [allOptions]);

  // after the mode filter, before the time filter — used for the time-chip counts
  const modeFiltered = useMemo(
    () =>
      modeFilter === "all"
        ? allOptions
        : allOptions.filter((o) => o.mode === modeFilter),
    [allOptions, modeFilter],
  );

  const depCounts = useMemo(() => {
    const c: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (const o of modeFiltered) {
      const b = bucketOf(o.departure);
      if (b >= 0) c[b] += 1;
    }
    return c;
  }, [modeFiltered]);

  const arrCounts = useMemo(() => {
    const c: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (const o of modeFiltered) {
      const b = bucketOf(o.arrival);
      if (b >= 0) c[b] += 1;
    }
    return c;
  }, [modeFiltered]);

  const sortedOptions: RouteOption[] = useMemo(() => {
    const base = modeFiltered.filter((o) => {
      if (depBuckets.size && !depBuckets.has(bucketOf(o.departure))) return false;
      if (arrBuckets.size && !arrBuckets.has(bucketOf(o.arrival))) return false;
      return true;
    });
    return [...base].sort((a, b) => a[sort] - b[sort]);
  }, [modeFiltered, sort, depBuckets, arrBuckets]);

  const timeFiltered = depBuckets.size > 0 || arrBuckets.size > 0;

  // tags (cheapest / fastest / best value) computed over the *visible* set
  const meta = useMemo(() => computeMeta(sortedOptions), [sortedOptions]);

  return (
    <>
      <SiteHeader />

      <main className="wrap search-main" id="main">
        <h1 className="sr-only">
          {from && to ? `${from} to ${to} — options` : "Search"}
        </h1>
        <SearchForm
          initialFrom={from}
          initialTo={to}
          initialDate={date ?? ""}
          initialOrigin={origin}
          initialDestination={destination}
        />

        {status === "loading" && (
          <section className="results" aria-busy="true">
            <div className="results-head">
              <h2 className="skeleton skeleton-title" />
            </div>
            <div className="cards">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rc rc-skeleton">
                  <div className="rc-main">
                    <div className="rc-op">
                      <span className="skeleton rc-logo" />
                      <div
                        className="skeleton skeleton-line"
                        style={{ width: 140, height: 14 }}
                      />
                    </div>
                    <div
                      className="skeleton skeleton-line"
                      style={{ width: "70%", height: 14 }}
                    />
                    <div
                      className="skeleton skeleton-line"
                      style={{ width: 90, height: 30 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="loading-note">
              <span className="spinner" /> Fetching bus, train and flight options…
            </p>
          </section>
        )}

        {status === "error" && (
          <section className="empty-state">
            <p>
              <b>Something went wrong.</b> Please try again in a moment.
            </p>
          </section>
        )}

        {status === "results" && data && (
          <section className="results">
            <div className="results-head">
              <h2>
                {data.from} → {data.to}
              </h2>
              <SortTabs value={sort} onChange={setSort} />
            </div>

            {meta.count > 0 && (
              <p className="results-summary">
                <b>{sortedOptions.length}</b>
                {timeFiltered || modeFilter !== "all"
                  ? ` of ${modeCounts.all}`
                  : ""}{" "}
                options ·{" "}
                <b>
                  {formatPrice(meta.minPrice)}–{formatPrice(meta.maxPrice)}
                </b>{" "}
                ·{" "}
                <b>
                  {formatDuration(meta.minDur)}–{formatDuration(meta.maxDur)}
                </b>
                {meta.cheapest && (
                  <>
                    {" · "}cheapest {formatPrice(meta.cheapest.price)} (
                    {meta.cheapest.mode})
                  </>
                )}
              </p>
            )}

            <div className="mode-filter" role="tablist" aria-label="Mode filter">
              {(
                [
                  ["all", "All"],
                  ["bus", "Bus"],
                  ["train", "Train"],
                  ["flight", "Flight"],
                ] as const
              ).map(([m, label]) => {
                const n = modeCounts[m] ?? 0;
                return (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={modeFilter === m}
                    disabled={m !== "all" && n === 0}
                    className={`mf-chip mf-${m}${modeFilter === m ? " active" : ""}`}
                    onClick={() => setModeFilter(m)}
                  >
                    {label}
                    {m !== "all" && <span className="mf-n">{n}</span>}
                  </button>
                );
              })}
            </div>

            <TimeFilter
              dep={depBuckets}
              arr={arrBuckets}
              depCounts={depCounts}
              arrCounts={arrCounts}
              onToggleDep={(id) => toggleBucket(setDepBuckets, id)}
              onToggleArr={(id) => toggleBucket(setArrBuckets, id)}
              onClear={() => {
                setDepBuckets(new Set());
                setArrBuckets(new Set());
              }}
            />

            <RouteActions
              from={data.from}
              to={data.to}
              cheapestPrice={meta.cheapest?.price}
            />

            {sortedOptions.length > 0 ? (
              <div className="cards">
                {sortedOptions.map((opt, i) => (
                  <ResultCard
                    key={`${opt.mode}-${opt.operator}-${i}`}
                    option={opt}
                    from={data.from}
                    to={data.to}
                    tags={tagsFor(opt, meta)}
                  />
                ))}
              </div>
            ) : (
              <p className="route-note">
                No options match these filters.{" "}
                <button
                  type="button"
                  className="linklike"
                  onClick={() => {
                    setModeFilter("all");
                    setDepBuckets(new Set());
                    setArrBuckets(new Set());
                  }}
                >
                  Clear filters
                </button>
              </p>
            )}

            {sortedOptions.some((o) => o.indicative) && (
              <p className="route-note">
                <b>Indicative</b> fares are approximate (live provider API not
                connected yet). Actual price and availability are confirmed on
                the booking page — usually a little higher.
              </p>
            )}

            <HotelCta city={data.to} checkIn={date} />
            <TripExtras city={data.to} from={data.from} date={date} />
          </section>
        )}

        {status === "empty" && (
          <section className="empty-state">
            <p>
              <b>
                {from && to
                  ? "No options found for this route yet."
                  : "Search a route above."}
              </b>{" "}
              Try one of these sample routes:
            </p>
            <div className="examples">
              {SAMPLE_ROUTES.map(({ from: f, to: t }) => (
                <Link
                  key={`${f}-${t}`}
                  className="example-chip"
                  href={`/search?from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}`}
                >
                  {f} → {t}
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link href="/" className="back-link">
          ← Nayi search
        </Link>
      </main>

      <SiteFooter />
    </>
  );
}
