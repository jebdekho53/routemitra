"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { RouteResult, RouteOption, SortKey } from "@/types/route";
import { listSampleRoutes } from "@/lib/sample-data";
import ResultCard from "@/components/ResultCard";
import SortTabs from "@/components/SortTabs";
import SearchForm from "@/components/SearchForm";

type Status = "loading" | "results" | "empty" | "error";

const SAMPLE_ROUTES = listSampleRoutes();

export default function SearchResults() {
  const params = useSearchParams();
  const from = params.get("from")?.trim() ?? "";
  const to = params.get("to")?.trim() ?? "";
  const date = params.get("date");

  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<RouteResult | null>(null);
  const [sort, setSort] = useState<SortKey>("price");

  useEffect(() => {
    if (!from || !to) {
      setStatus("empty");
      setData(null);
      return;
    }

    const qs = new URLSearchParams({ from, to });
    if (date) qs.set("date", date);

    let cancelled = false;
    setStatus("loading");

    fetch(`/api/search?${qs.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<RouteResult>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setStatus(json.options.length > 0 ? "results" : "empty");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [from, to, date]);

  const sortedOptions: RouteOption[] = useMemo(() => {
    if (!data) return [];
    return [...data.options].sort((a, b) => a[sort] - b[sort]);
  }, [data, sort]);

  return (
    <>
      <header className="masthead">
        <div className="wrap">
          <div className="brand">
            <div className="line-dots">
              <span />
              <span />
              <span />
            </div>
            <span className="eyebrow">Demo build · sample data</span>
          </div>
          <h1>RouteMitra</h1>
        </div>
      </header>

      <main className="wrap">
        <SearchForm initialFrom={from} initialTo={to} />

        {status === "loading" && (
          <section className="loading-state">
            <div className="spinner" />
            <p>Bus, train aur flight options la rahe hain…</p>
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
                <ResultCard key={`${opt.mode}-${opt.operator}-${i}`} option={opt} />
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

      <footer className="site-footer">
        <div className="wrap">
          <p>
            Ye sample/dummy data hai — koi live booking nahi hoti. &quot;Book
            karein&quot; dabane par respective platform khulega.
          </p>
        </div>
      </footer>
    </>
  );
}
