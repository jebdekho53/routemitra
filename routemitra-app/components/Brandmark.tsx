// RouteMitra brandmark — the three-mode dots (bus / train / flight) inside a
// rounded tile. Used in the masthead and as the app icon.
export default function Brandmark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="RouteMitra"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="512" height="512" rx="112" fill="var(--accent)" />
      <circle cx="168" cy="256" r="46" fill="#fff" />
      <circle cx="256" cy="256" r="46" fill="#fff" />
      <circle cx="344" cy="256" r="46" fill="#fff" />
    </svg>
  );
}
