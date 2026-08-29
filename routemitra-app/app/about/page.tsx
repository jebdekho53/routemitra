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
            RouteMitra ek city-to-city travel search hai — ek route ke liye bus,
            train aur flight teeno options ek jagah, price aur time ke saath.
            Booking khud RouteMitra par nahi hoti; hum tumhe RedBus, IRCTC ya
            airline/OTA ke page par bhej dete hain.
          </p>
          <p>
            Ye product abhi actively ban raha hai. Jahan live provider API abhi
            connect nahi hui, wahan fare <b>indicative</b> (estimate) dikhta hai
            aur clearly label hota hai.
          </p>
          <p>Sawaal ya feedback? <a href="/help">Help / Contact</a> page dekho.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
