import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/src/lib/supabase-admin";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

async function upsertSubscription(payload: {
  user_id: string;
  email?: string;
  plan?: string;
  status: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_checkout_session_id?: string | null;
  current_period_end?: string | null;
  stripe_price_id?: string | null;
  cancel_at_period_end?: boolean;
}) {
  const { error } = await supabaseAdmin.from("user_subscriptions").upsert(
    {
      user_id: payload.user_id,
      email: payload.email || null,
      plan: payload.plan || "pro",
      status: payload.status,
      stripe_customer_id: payload.stripe_customer_id || null,
      stripe_subscription_id: payload.stripe_subscription_id || null,
      stripe_checkout_session_id: payload.stripe_checkout_session_id || null,
      current_period_end: payload.current_period_end || null,
      stripe_price_id: payload.stripe_price_id || null,
      cancel_at_period_end: payload.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id", ignoreDuplicates: false }
  );

  if (error) throw error;
}

function unixToIso(v?: number | null) {
  if (!v) return null;
  return new Date(v * 1000).toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = String(session.metadata?.user_id || session.client_reference_id || "").trim();

      if (userId) {
        let currentPeriodEnd: string | null = null;
        let priceId: string | null = null;
        let cancelAtPeriodEnd = false;

        if (session.subscription && typeof session.subscription === "string") {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          currentPeriodEnd = unixToIso(sub.current_period_end);
          cancelAtPeriodEnd = sub.cancel_at_period_end;
          priceId = sub.items.data[0]?.price?.id || null;
        }

        await upsertSubscription({
          user_id: userId,
          email: session.customer_details?.email || session.metadata?.email || undefined,
          plan: "pro",
          status: "active",
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
          stripe_checkout_session_id: session.id,
          current_period_end: currentPeriodEnd,
          stripe_price_id: priceId,
          cancel_at_period_end: cancelAtPeriodEnd,
        });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = String(sub.metadata?.user_id || "").trim();

      if (userId) {
        await upsertSubscription({
          user_id: userId,
          email: sub.metadata?.email || undefined,
          plan: "pro",
          status: sub.status === "active" || sub.status === "trialing" ? "active" : sub.status,
          stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
          stripe_subscription_id: sub.id,
          current_period_end: unixToIso(sub.current_period_end),
          stripe_price_id: sub.items.data[0]?.price?.id || null,
          cancel_at_period_end: sub.cancel_at_period_end,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = String(sub.metadata?.user_id || "").trim();

      if (userId) {
        await upsertSubscription({
          user_id: userId,
          email: sub.metadata?.email || undefined,
          plan: "pro",
          status: "canceled",
          stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
          stripe_subscription_id: sub.id,
          current_period_end: unixToIso(sub.current_period_end),
          cancel_at_period_end: true,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Webhook failed" },
      { status: 400 }
    );
  }
}
