import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import Providers from "./providers";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RouteMitra — Bus, Train & Flight ek jagah",
    template: "%s | RouteMitra",
  },
  description:
    "Ek city se dusri city — bus, train aur flight teeno options ek hi jagah compare karo.",
  openGraph: { siteName: "RouteMitra", type: "website" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "RouteMitra" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efece6" },
    { media: "(prefers-color-scheme: dark)", color: "#17150f" },
  ],
};

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* apply saved theme before paint — avoids a flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('routemitra_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>{children}</Providers>
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
