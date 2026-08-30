"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
const KEY = "routemitra_theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    // One-off sync from an external store (localStorage) on mount — the
    // "subscribe to external state" case effects are for.
    try {
      const saved = (localStorage.getItem(KEY) as Theme) || "system";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved !== "system") setTheme(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function cycle() {
    const next: Theme =
      theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    apply(next);
    try {
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }

  const label =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "Auto";
  const icon = theme === "light" ? "☀" : theme === "dark" ? "☾" : "◐";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cycle}
      aria-label={`Theme: ${label}. Tap to change.`}
      title={`Theme: ${label}`}
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}
