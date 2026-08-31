import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { dbEnabled } from "@/lib/db";
import {
  listSavedSearches,
  listWatches,
  listFavourites,
} from "@/lib/user-data";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import { WatchList, FavouriteList } from "./DashboardLists";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  if (!dbEnabled) {
    return (
      <>
        <Masthead title="Dashboard" />
        <main className="wrap">
          <p className="muted">
            The database isn’t configured — saved searches, watches and
            favourites aren’t being stored.
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const [searches, watches, favourites] = await Promise.all([
    listSavedSearches(session.user.id),
    listWatches(session.user.id),
    listFavourites(session.user.id),
  ]);

  return (
    <>
      <Masthead title={`Hi, ${session.user.name?.split(" ")[0] ?? "there"}`} />
      <main className="wrap">
        {!session.user.verified && (
          <p className="auth-hint">
            Your email isn’t verified yet — check your inbox for the link.
          </p>
        )}

        <section className="dash-block">
          <h2>Recent searches</h2>
          {searches.length === 0 ? (
            <p className="muted">No searches yet.</p>
          ) : (
            <ul className="dash-list">
              {searches.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/search?from=${encodeURIComponent(s.from_city)}&to=${encodeURIComponent(s.to_city)}`}
                  >
                    {s.from_city} → {s.to_city}
                  </Link>
                  <span className="muted">
                    {" "}
                    · {new Date(s.created_at).toLocaleDateString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dash-block">
          <h2>Price watches</h2>
          <WatchList initial={watches} />
        </section>

        <section className="dash-block">
          <h2>Favourite routes</h2>
          <FavouriteList initial={favourites} />
        </section>

        <Link href="/account" className="back-link">
          Account settings →
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
