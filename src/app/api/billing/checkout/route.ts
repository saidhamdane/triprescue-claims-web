import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

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

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

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
      return NextResponse.json(
        { ok: false, error: "Missing STRIPE_PRICE_ID or payment link" },
        { status: 500 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.EXPO_PUBLIC_APP_URL ||
      "https://triprescue.ai";

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
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          email,
        },
      },
      success_url: `${origin}/billing/success?incidentId=${encodeURIComponent(incidentId)}&returnTo=${encodeURIComponent(returnTo)}`,
      cancel_url: `${origin}/billing/cancel?incidentId=${encodeURIComponent(incidentId)}&returnTo=${encodeURIComponent(returnTo)}`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
