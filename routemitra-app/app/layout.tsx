import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import Providers from "./providers";
import CookieConsent from "@/components/CookieConsent";
import BottomNav from "@/components/BottomNav";
import FeedbackButton from "@/components/FeedbackButton";
import ResumeBooking from "@/components/ResumeBooking";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RouteMitra — Bus, Train & Flight in one place",
    template: "%s | RouteMitra",
  },
  description:
    "Compare bus, train and flight options between two cities in one place.",
  openGraph: { siteName: "RouteMitra", type: "website" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "RouteMitra" },
  other: {
    // Cuelinks channel ownership verification (affiliate network).
    "cuelinks-verification": "VERIFY-CL-1HCTWR4R",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f4f7" },
    { media: "(prefers-color-scheme: dark)", color: "#12141a" },
  ],
};

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* apply saved theme before paint — avoids a flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('routemitra_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${plexMono.variable}`}
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ResumeBooking />
        <Providers>
          {children}
          <BottomNav />
          <FeedbackButton />
        </Providers>
        <CookieConsent />
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
