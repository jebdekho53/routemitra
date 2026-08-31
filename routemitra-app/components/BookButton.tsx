"use client";

import type { RouteOption } from "@/types/route";

// Fires a click-tracking beacon (Phase 7) and a Plausible custom event, then
// lets the normal link navigation happen. sendBeacon keeps working even as
// the new tab opens / the page unloads.
export default function BookButton({
  option,
  from,
  to,
}: {
  option: RouteOption;
  from: string;
  to: string;
}) {
  function track() {
    const payload = {
      mode: option.mode,
      operator: option.operator,
      price: option.price,
      from,
      to,
      indicative: Boolean(option.indicative),
    };
    try {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon?.("/api/track", blob);
    } catch {
      // ignore — tracking must never block the booking click
    }
    // Plausible (loaded only if NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set)
    (
      window as unknown as {
        plausible?: (e: string, o?: Record<string, unknown>) => void;
      }
    ).plausible?.("Book click", {
      props: { mode: option.mode, operator: option.operator },
    });
  }

  return (
    <a
      className="book-btn"
      href={option.link}
      target="_blank"
      rel="noopener"
      onClick={track}
    >
      Book now →
    </a>
  );
}
