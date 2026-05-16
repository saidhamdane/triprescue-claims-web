"use client";

import { useEffect, useMemo } from "react";

function isSafeDeepLink(url: string): boolean {
  if (!url) return false;
  if (/^exp:\/\//i.test(url)) return false;
  if (/localhost/i.test(url)) return false;
  if (/127\.0\.0\.1/.test(url)) return false;
  if (/10\.\d+\.\d+\.\d+:\d+/.test(url)) return false;
  return true;
}

export default function BillingSuccessPage() {
  const { sessionId, appUrl } = useMemo(() => {
    if (typeof window === "undefined") return { sessionId: "", appUrl: "" };

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id") || "";
    const deepLinkParam = params.get("deepLink") || "";
    const incidentId = params.get("incidentId") || "";
    const returnTo = params.get("returnTo") || "/incident/claim-summary";

    const appUrl =
      deepLinkParam && isSafeDeepLink(deepLinkParam)
        ? deepLinkParam
        : `triprescue:///subscription-success?incidentId=${encodeURIComponent(incidentId)}&returnTo=${encodeURIComponent(returnTo)}`;

    console.log("[billing] success redirect deepLink =", appUrl);
    return { sessionId, appUrl };
  }, []);

  useEffect(() => {
    if (!appUrl) return;

    // Activate the subscription server-side, then redirect.
    // A 4-second hard timeout ensures the user is never stuck here.
    let redirected = false;
    const redirect = () => {
      if (redirected) return;
      redirected = true;
      window.location.href = appUrl;
    };

    const maxWait = setTimeout(redirect, 4000);

    if (sessionId) {
      fetch("/api/billing/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (!data.ok) console.warn("[billing] activate response:", data.error);
        })
        .catch((e) => console.warn("[billing] activate fetch error:", e))
        .finally(() => {
          clearTimeout(maxWait);
          // Small pause so the "active" badge is visible before redirect.
          setTimeout(redirect, 600);
        });
    } else {
      // No session_id — redirect after a short delay (webhook will handle activation).
      setTimeout(redirect, 1200);
      clearTimeout(maxWait);
    }

    return () => clearTimeout(maxWait);
  }, [sessionId, appUrl]);

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
