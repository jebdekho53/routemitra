"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { getTheme, setTheme, type Theme } from "@/lib/theme";

const NAV_LINKS = [{ href: "/", label: "Search" }];
// only meaningful once signed in — both pages redirect to /login otherwise
const ACCOUNT_LINKS = [
  { href: "/dashboard", label: "Saved & alerts" },
  { href: "/account", label: "Account" },
];
const SECONDARY = [
  { href: "/about", label: "About" },
  { href: "/help", label: "Help center" },
  { href: "/contact", label: "Contact & support" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];
const THEMES: { key: Theme; label: string }[] = [
  { key: "system", label: "Auto" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

export default function NavMenu() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    setThemeState(getTheme());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function pickTheme(t: Theme) {
    setTheme(t);
    setThemeState(t);
  }

  const sheet = (
    <div className="nav-scrim" onClick={() => setOpen(false)}>
      <nav
        className="nav-sheet"
        aria-label="Main menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nav-sheet-head">
          <span className="eyebrow">
            {session?.user
              ? `Hi, ${session.user.name?.split(" ")[0] ?? "there"}`
              : "Menu"}
          </span>
          <button
            type="button"
            className="nav-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <ul className="nav-list">
          {[...NAV_LINKS, ...(session?.user ? ACCOUNT_LINKS : [])].map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-auth">
          {session?.user ? (
            <button
              type="button"
              className="go-btn"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="go-btn"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="oauth-btn"
                onClick={() => setOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <div className="nav-theme">
          <span className="eyebrow">Theme</span>
          <div className="nav-theme-opts">
            {THEMES.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`sort-tab${theme === t.key ? " active" : ""}`}
                onClick={() => pickTheme(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="nav-secondary">
          {SECONDARY.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  // Desktop (>=64em, CSS-gated) gets a real inline nav instead of a hamburger
  // — there's room for it, and hiding every link behind a drawer wasted the
  // whole right half of the app bar.
  const desktopNav = (
    <nav className="appbar-nav" aria-label="Main menu">
      <ul className="appbar-nav-links">
        {[...NAV_LINKS, ...(session?.user ? ACCOUNT_LINKS : [])].map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
        <li>
          <Link href="/help">Help</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>

      <div className="appbar-nav-theme" role="group" aria-label="Theme">
        {THEMES.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`appbar-theme-btn${theme === t.key ? " active" : ""}`}
            title={t.label}
            aria-label={`${t.label} theme`}
            aria-pressed={theme === t.key}
            onClick={() => pickTheme(t.key)}
          >
            {t.key === "system" ? "🖥" : t.key === "light" ? "☀" : "🌙"}
          </button>
        ))}
      </div>

      {session?.user ? (
        <button
          type="button"
          className="appbar-nav-btn"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Logout
        </button>
      ) : (
        <>
          <Link href="/login" className="appbar-nav-link">
            Login
          </Link>
          <Link href="/signup" className="appbar-nav-btn">
            Sign up
          </Link>
        </>
      )}
    </nav>
  );

  return (
    <>
      {desktopNav}
      <button
        type="button"
        className="nav-menu-btn"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden>☰</span>
      </button>
      {/* portal past .appbar — its backdrop-filter would otherwise trap
          position:fixed inside the 56px bar */}
      {mounted && open && createPortal(sheet, document.body)}
    </>
  );
}
