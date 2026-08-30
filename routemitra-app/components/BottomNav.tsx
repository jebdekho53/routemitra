"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const ICONS = {
  search: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  saved: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="m12 4 2.5 5 5.5.8-4 3.9 1 5.5L12 22l-4.9-2.6 1-5.5-4-3.9L11.5 9 12 4Z" />
    </svg>
  ),
  account: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  ),
};

const TABS = [
  {
    href: "/",
    label: "Search",
    icon: ICONS.search,
    match: (p: string) =>
      p === "/" || p.startsWith("/search") || p.startsWith("/routes"),
  },
  {
    href: "/dashboard",
    label: "Saved",
    icon: ICONS.saved,
    match: (p: string) => p.startsWith("/dashboard"),
  },
  {
    href: "/account",
    label: "Account",
    icon: ICONS.account,
    match: (p: string) =>
      p.startsWith("/account") ||
      p.startsWith("/login") ||
      p.startsWith("/signup"),
  },
];

// Fixed bottom tab bar — mobile only (CSS hides it >= 48em). Gives the
// standalone PWA an app-like primary nav.
export default function BottomNav() {
  const pathname = usePathname() || "/";
  const { data: session } = useSession();

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map((t) => {
        const href =
          t.href === "/account" && !session?.user ? "/login" : t.href;
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={href}
            className={`bottom-nav-item${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="bottom-nav-icon" aria-hidden>
              {t.icon}
            </span>
            <span className="bottom-nav-label">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
