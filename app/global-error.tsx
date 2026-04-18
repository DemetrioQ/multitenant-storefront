"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>Something broke</h1>
        <p style={{ marginTop: "1rem", color: "#6b7280" }}>
          The app ran into an unexpected problem loading this page.
        </p>
        {error.digest && (
          <p style={{ marginTop: "0.5rem", color: "#9ca3af", fontFamily: "monospace", fontSize: "0.75rem" }}>
            ref: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "2rem",
            padding: "0.625rem 1.5rem",
            borderRadius: "9999px",
            background: "#111827",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
