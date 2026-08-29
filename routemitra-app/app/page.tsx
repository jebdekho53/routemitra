import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import { popularRouteSlugs, fromSlug } from "@/lib/routes";

export default function Home() {
  const routes = popularRouteSlugs();

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
          <p className="tagline">
            Ek city se dusri city — <b>bus, train aur flight</b> teeno options ek
            hi jagah compare karo. Ye ek working demo hai, sample data ke saath.
          </p>
        </div>
      </header>

      <main className="wrap">
        <SearchForm />

        <nav className="popular">
          <h2>Popular routes</h2>
          <div className="popular-grid">
            {routes.map((slug) => {
              const r = fromSlug(slug)!;
              return (
                <Link key={slug} href={`/routes/${slug}`}>
                  {r.from} → {r.to}
                </Link>
              );
            })}
          </div>
        </nav>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <p>
            Ye sample/dummy data hai — koi live booking nahi hoti. Real
            bus/train/flight prices connect karne ka plan{" "}
            <a
              href="https://claude.ai/code/artifact/5ba4103a-e59f-4e05-b6a3-814de3be1cc8"
              target="_blank"
              rel="noopener"
            >
              RouteMitra Blueprint
            </a>{" "}
            mein hai. &quot;Book karein&quot; dabane par respective platform
            khulega.
          </p>
        </div>
      </footer>
    </>
  );
}
