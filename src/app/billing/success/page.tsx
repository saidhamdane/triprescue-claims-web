"use client";

import { useEffect, useMemo } from "react";

export default function BillingSuccessPage() {
  const appUrl = useMemo(() => {
    if (typeof window === "undefined") return "triprescue://subscription-success";

    const params = new URLSearchParams(window.location.search);
    const incidentId = params.get("incidentId") || "";
    const returnTo =
      params.get("returnTo") || "/incident/claim-summary";

    const deep = new URL("triprescue://subscription-success");
    if (incidentId) deep.searchParams.set("incidentId", incidentId);
    if (returnTo) deep.searchParams.set("returnTo", returnTo);

    return deep.toString();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = appUrl;
    }, 1200);

    return () => clearTimeout(t);
  }, [appUrl]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        fontFamily: "Arial, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: 999,
            background: "#dcfce7",
            color: "#166534",
            fontWeight: 700,
            fontSize: 12,
            marginBottom: 14,
          }}
        >
          Subscription active
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 32,
            lineHeight: 1.15,
            color: "#0f172a",
            fontWeight: 800,
          }}
        >
          Your Pro access is now active
        </h1>

        <p
          style={{
            marginTop: 14,
            marginBottom: 0,
            fontSize: 16,
            lineHeight: 1.7,
            color: "#475569",
          }}
        >
          Returning you to the TripRescue app…
        </p>

        <div style={{ marginTop: 22 }}>
          <a
            href={appUrl}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
              padding: "0 18px",
              borderRadius: 14,
              background: "#2563eb",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Open App Now
          </a>
        </div>
      </div>
    </main>
  );
}
