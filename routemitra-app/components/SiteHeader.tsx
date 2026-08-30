"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Brandmark from "@/components/Brandmark";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";

// Sticky translucent app bar, shared by every page. Adds a hairline border
// once the page is scrolled so it separates cleanly from content.
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="appbar" data-scrolled={scrolled}>
      <div className="wrap appbar-inner">
        <Link href="/" className="brand" aria-label="RouteMitra — home">
          <Brandmark size={24} />
          <span className="brand-word">RouteMitra</span>
          <span className="eyebrow">Bus · Train · Flight · one search</span>
        </Link>
        <div className="appbar-actions">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
