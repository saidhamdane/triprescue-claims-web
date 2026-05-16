"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function isSafeDeepLink(url: string): boolean {
  if (!url) return false;
  if (/^exp:\/\//i.test(url)) return false;
  if (/localhost/i.test(url)) return false;
  if (/127\.0\.0\.1/.test(url)) return false;
  if (/10\.\d+\.\d+\.\d+:\d+/.test(url)) return false;
  return true;
}

type ActivationState = "activating" | "success" | "error" | "no-session";

function BillingSuccessInner() {
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session_id") || "";
  const deepLinkParam = searchParams.get("deepLink") || "";
  const incidentId = searchParams.get("incidentId") || "";
  const returnTo = searchParams.get("returnTo") || "/incident/claim-summary";

  const appUrl =
    deepLinkParam && isSafeDeepLink(deepLinkParam)
      ? deepLinkParam
      : `triprescue:///subscription-success?incidentId=${encodeURIComponent(incidentId)}&returnTo=${encodeURIComponent(returnTo)}`;

  const [activationState, setActivationState] = useState<ActivationState>("activating");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    console.log("[billing] success page mounted");
    console.log("[billing] success session_id =", sessionId);
    console.log("[billing] success redirect deepLink =", appUrl);

    if (!sessionId) {
      setActivationState("no-session");
      const t = setTimeout(() => {
        window.location.href = appUrl;
      }, 1200);
      return () => clearTimeout(t);
    }

    let redirected = false;
    const doRedirect = () => {
      if (redirected) return;
      redirected = true;
      window.location.href = appUrl;
    };

    // Hard cap: redirect no matter what after 4 seconds.
    const maxWait = setTimeout(doRedirect, 4000);

    console.log("[billing] calling activate");

    fetch("/api/billing/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("[billing] activate response =", JSON.stringify(data));
        if (data.ok) {
          setActivationState("success");
        } else {
          console.warn("[billing] activate error =", data.error);
          setActivationState("error");
          setErrorMsg(data.error || "Unknown error");
        }
      })
      .catch((e) => {
        console.log("[billing] activate error =", e?.message);
        setActivationState("error");
        setErrorMsg(e?.message || "Network error");
      })
      .finally(() => {
        clearTimeout(maxWait);
        // Short pause so the success/error state is visible before redirect.
        setTimeout(doRedirect, 600);
      });

    return () => clearTimeout(maxWait);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const statusLabel: Record<ActivationState, string> = {
    activating: "Activating subscription…",
    success: "Activation successful",
    error: `Activation failed: ${errorMsg}`,
    "no-session": "Activation failed: missing session_id",
  };

  const statusColor: Record<ActivationState, string> = {
    activating: "#1d4ed8",
    success: "#166534",
    error: "#991b1b",
    "no-session": "#991b1b",
  };

  const statusBg: Record<ActivationState, string> = {
    activating: "#dbeafe",
    success: "#dcfce7",
    error: "#fee2e2",
    "no-session": "#fee2e2",
  };

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
            background: statusBg[activationState],
            color: statusColor[activationState],
            fontWeight: 700,
            fontSize: 12,
            marginBottom: 14,
          }}
        >
          {statusLabel[activationState]}
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
          {activationState === "activating"
            ? "Activating your subscription…"
            : activationState === "success"
            ? "Returning you to the TripRescue app…"
            : statusLabel[activationState]}
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

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BillingSuccessInner />
    </Suspense>
  );
}
