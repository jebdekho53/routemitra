"use client";

// Catches errors in the root layout itself. Must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="hi">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          background: "#f2f4f7",
          color: "#16181d",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 22 }}>Kuch gadbad ho gayi</h1>
          <p>Page load nahi ho paaya. Dobara try karo.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 12,
              padding: "10px 20px",
              border: "none",
              borderRadius: 8,
              background: "#0a6ed1",
              color: "#fff",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Dobara try karo
          </button>
          {error.digest && (
            <p style={{ fontSize: 12, opacity: 0.6, marginTop: 12 }}>
              Ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
