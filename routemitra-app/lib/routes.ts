// Slug helpers for the static /routes/[slug] SEO pages.

import { listSampleRoutes } from "@/lib/sample-data";

export function toSlug(from: string, to: string): string {
  const s = (x: string) => x.trim().toLowerCase().replace(/\s+/g, "-");
  return `${s(from)}-to-${s(to)}`;
}

export function fromSlug(
  slug: string,
): { from: string; to: string } | null {
  const m = /^(.+)-to-(.+)$/.exec(slug);
  if (!m) return null;
  const cap = (x: string) =>
    x
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  return { from: cap(m[1]), to: cap(m[2]) };
}

// Routes we pre-render at build time (both directions of every sample route).
export function popularRouteSlugs(): string[] {
  const set = new Set<string>();
  for (const { from, to } of listSampleRoutes()) {
    set.add(toSlug(from, to));
    set.add(toSlug(to, from));
  }
  return [...set];
}
