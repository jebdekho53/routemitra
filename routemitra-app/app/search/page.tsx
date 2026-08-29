import { Suspense } from "react";
import SearchResults from "./SearchResults";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="wrap">
          <section className="loading-state">
            <div className="spinner" />
            <p>Load ho raha hai…</p>
          </section>
        </main>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
