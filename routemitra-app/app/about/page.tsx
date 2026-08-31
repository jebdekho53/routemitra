import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <Masthead title="About RouteMitra" />
      <main className="wrap">
        <div className="prose">
          <p>
            RouteMitra is a city-to-city travel search — for one route you get
            bus, train and flight options in one place, with price and time.
            Booking doesn’t happen on RouteMitra; we send you to RedBus, IRCTC
            or the airline / OTA page.
          </p>
          <p>
            This product is actively being built. Where a live provider API
            isn’t connected yet, the fare shows as <b>indicative</b> (an
            estimate) and is clearly labelled.
          </p>
          <p>Questions or feedback? See the <a href="/help">Help</a> page.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
