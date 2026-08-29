"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { RouteResult, RouteOption, SortKey } from "@/types/route";
import { listSampleRoutes } from "@/lib/sample-data";
import ResultCard from "@/components/ResultCard";
import SortTabs from "@/components/SortTabs";
import SearchForm from "@/components/SearchForm";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";

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

  const sortedOptions: RouteOption[] = useMemo(() => {
    if (!data) return [];
    return [...data.options].sort((a, b) => a[sort] - b[sort]);
  }, [data, sort]);

  return (
    <>
      <Masthead />

      <main className="wrap">
        <SearchForm
          initialFrom={from}
          initialTo={to}
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
                <div key={i} className="card card-skeleton">
                  <div className="bar" />
                  <div className="skeleton skeleton-line" style={{ width: 60 }} />
                  <div className="card-body">
                    <div
                      className="skeleton skeleton-line"
                      style={{ width: "55%", height: 15 }}
                    />
                    <div
                      className="skeleton skeleton-line"
                      style={{ width: "75%", marginTop: 8 }}
                    />
                  </div>
                  <div
                    className="skeleton skeleton-line"
                    style={{ width: 96, height: 34 }}
                  />
                </div>
              ))}
            </div>
            <p className="loading-note">
              <span className="spinner" /> Bus, train aur flight options la rahe
              hain…
            </p>
          </section>
        )}

        {status === "error" && (
          <section className="empty-state">
            <p>
              <b>Kuch gadbad ho gayi.</b> Thodi der baad dobara try karo.
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
            <div className="cards">
              {sortedOptions.map((opt, i) => (
                <ResultCard
                  key={`${opt.mode}-${opt.operator}-${i}`}
                  option={opt}
                  from={data.from}
                  to={data.to}
                />
              ))}
            </div>
          </section>
        )}

        {status === "empty" && (
          <section className="empty-state">
            <p>
              <b>
                {from && to
                  ? "Is route ke liye abhi koi option nahi mila."
                  : "Upar se ek route search karo."}
              </b>{" "}
              Ye sample routes try karo:
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
