import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

function isSafeDeepLink(url: string): boolean {
  if (!url) return false;
  if (/^exp:\/\//i.test(url)) return false;
  if (/localhost/i.test(url)) return false;
  if (/127\.0\.0\.1/.test(url)) return false;
  if (/10\.\d+\.\d+\.\d+:\d+/.test(url)) return false;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const paymentLink =
      process.env.EXPO_PUBLIC_STRIPE_PAYMENT_LINK ||
      process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

    const userId = String(body?.userId || "").trim();
    const email = String(body?.email || "").trim();
    const incidentId = String(body?.incidentId || "").trim();
    const returnTo = String(body?.returnTo || "/incident/claim-summary").trim();
    const successDeepLink = String(body?.successDeepLink || "").trim();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    // Always use the production HTTPS base URL for Stripe redirect — never Expo dev URLs.
    const webBase = process.env.NEXT_PUBLIC_WEB_BASE_URL || "https://claims.triprescue.site";

    // Resolve the native deep link: prefer caller-supplied successDeepLink, fall back to constructing one.
    const deepLink =
      successDeepLink && isSafeDeepLink(successDeepLink)
        ? successDeepLink
        : `triprescue:///subscription-success?incidentId=${encodeURIComponent(incidentId)}&returnTo=${encodeURIComponent(returnTo)}`;

    if (paymentLink) {
      const url = new URL(paymentLink);
      url.searchParams.set("client_reference_id", userId);
      if (email) url.searchParams.set("prefilled_email", email);
      url.searchParams.set("incidentId", incidentId);
      url.searchParams.set("returnTo", returnTo);
      return NextResponse.json({ ok: true, url: url.toString() });
    }

    const priceId = process.env.STRIPE_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ ok: false, error: "Missing STRIPE_PRICE_ID or payment link" }, { status: 500 });
    }

    const successUrl = `${webBase}/billing/success?session_id={CHECKOUT_SESSION_ID}&deepLink=${encodeURIComponent(deepLink)}`;
    const cancelUrl = `${webBase}/billing/cancel?incidentId=${encodeURIComponent(incidentId)}&returnTo=${encodeURIComponent(returnTo)}`;

    console.log("[billing] checkout success_url =", successUrl);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        email,
        incident_id: incidentId,
        return_to: returnTo,
        deep_link: deepLink,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          email,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Checkout failed" }, { status: 500 });
  }
}
