// Shared light/dark/auto theme handling. The no-flash bootstrap lives inline
// in app/layout.tsx; this is the runtime control used by the nav sheet.

export type Theme = "light" | "dark" | "system";
export const THEME_KEY = "routemitra_theme";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

export function setTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  try {
    if (theme === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}
