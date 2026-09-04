// Decorative "journey line" for the homepage hero — an original abstract
// route from a bus stop to a train icon to a plane, no photography/licensing
// involved. Purely decorative (aria-hidden), hidden on narrow screens via CSS.
export default function HeroArt() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 420 300"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="haLine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--warm-1)" />
          <stop offset="100%" stopColor="var(--warm-2)" />
        </linearGradient>
        <radialGradient id="haGlow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--warm-3)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--warm-3)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="haGlow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--warm-2)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--warm-2)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="330" cy="70" r="120" fill="url(#haGlow1)" />
      <circle cx="90" cy="230" r="140" fill="url(#haGlow2)" />

      {/* the route */}
      <path
        d="M40 230 C 110 230, 120 150, 190 150 S 280 60, 380 60"
        stroke="url(#haLine)"
        strokeWidth="2.5"
        strokeDasharray="1 12"
        strokeLinecap="round"
      />

      {/* bus stop */}
      <g transform="translate(24 214)">
        <circle r="16" fill="var(--surface)" stroke="var(--warm-1)" strokeWidth="1.5" />
        <path
          d="M-7 -5h14v9a2 2 0 0 1-2 2H-5a2 2 0 0 1-2-2Z"
          fill="none"
          stroke="var(--warm-1)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M-7 -1h14" stroke="var(--warm-1)" strokeWidth="1.4" />
        <circle cx="-3.5" cy="6.5" r="1.3" fill="var(--warm-1)" />
        <circle cx="3.5" cy="6.5" r="1.3" fill="var(--warm-1)" />
      </g>

      {/* mid stop — train */}
      <g transform="translate(190 150)">
        <circle r="18" fill="var(--surface)" stroke="var(--warm-2)" strokeWidth="1.5" />
        <rect x="-7" y="-8" width="14" height="12" rx="3" fill="none" stroke="var(--warm-2)" strokeWidth="1.4" />
        <path d="M-7 -2h14" stroke="var(--warm-2)" strokeWidth="1.4" />
        <circle cx="-3.5" cy="7" r="1.3" fill="var(--warm-2)" />
        <circle cx="3.5" cy="7" r="1.3" fill="var(--warm-2)" />
      </g>

      {/* destination — flight */}
      <g transform="translate(380 60) rotate(35)">
        <circle r="20" fill="var(--surface)" stroke="var(--warm-2)" strokeWidth="1.5" transform="rotate(-35)" />
        <path
          d="M0 -9 L2.6 -2 8 1 2.6 2 1.6 8 0 4 -1.6 8 -2.6 2 -8 1 -2.6 -2Z"
          fill="var(--warm-2)"
        />
      </g>

      {/* scattered dots for texture */}
      <circle cx="130" cy="80" r="2" fill="var(--warm-3)" opacity="0.6" />
      <circle cx="260" cy="220" r="2.5" fill="var(--warm-1)" opacity="0.5" />
      <circle cx="60" cy="60" r="1.8" fill="var(--warm-2)" opacity="0.5" />
    </svg>
  );
}
