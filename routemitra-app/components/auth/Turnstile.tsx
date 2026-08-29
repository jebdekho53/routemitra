"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile widget. Renders nothing when the site key is unset
// (dev / before setup) — the server also skips verification in that case.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

export default function Turnstile({
  onToken,
}: {
  onToken: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    const scriptId = "cf-turnstile";
    const mount = () => {
      if (!window.turnstile || !ref.current || ref.current.childNodes.length)
        return;
      window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onToken(token),
      });
    };
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = mount;
      document.head.appendChild(s);
    } else {
      mount();
    }
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="turnstile" />;
}
