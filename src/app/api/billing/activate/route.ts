import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/src/lib/supabase-admin";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

function unixToIso(v?: number | null): string | null {
  if (!v) return null;
  return new Date(v * 1000).toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = String(body?.session_id || "").trim();

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "Missing session_id" }, { status: 400 });
    }

    // Retrieve the Stripe checkout session with subscription expanded.
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { ok: false, error: `Payment not completed (status: ${session.payment_status})` },
        { status: 400 }
      );
    }

    // userId must come from client_reference_id or metadata — never from email alone.
    const userId = String(
      session.client_reference_id || session.metadata?.user_id || ""
    ).trim();

    console.log("[billing] success userId =", userId);

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "No userId found in Stripe session (client_reference_id / metadata.user_id)" },
        { status: 400 }
      );
    }

    const sub = typeof session.subscription === "object"
      ? (session.subscription as Stripe.Subscription)
      : null;

    const status =
      sub?.status === "active" || sub?.status === "trialing" ? sub.status : "active";

    const upsertData = {
      user_id: userId,
      email: session.customer_details?.email || session.metadata?.email || null,
      plan: "pro",
      status,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      stripe_subscription_id: sub?.id || null,
      stripe_checkout_session_id: session.id,
      current_period_start: unixToIso(sub?.current_period_start),
      current_period_end: unixToIso(sub?.current_period_end),
      stripe_price_id: sub?.items?.data[0]?.price?.id || null,
      cancel_at_period_end: sub?.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    };

    console.log("[billing] upsert user_subscriptions =", JSON.stringify(upsertData));

    const { error } = await supabaseAdmin
      .from("user_subscriptions")
      .upsert(upsertData, { onConflict: "user_id", ignoreDuplicates: false });

    if (error) {
      console.error("[billing] upsert error =", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, userId, status });
  } catch (err: any) {
    console.error("[billing] upsert error =", err?.message);
    return NextResponse.json(
      { ok: false, error: err?.message || "Activation failed" },
      { status: 500 }
    );
  }
}
