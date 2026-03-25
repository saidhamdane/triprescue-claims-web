import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function upsertBillingSubscription(input: {
  user_id: string | null;
  email: string | null;
  subscription_id: string;
  customer_id: string | null;
  checkout_session_id?: string | null;
  status: string | null;
  price_id: string | null;
  product_id: string | null;
  plan_key: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  metadata?: any;
}) {
  const { error } = await supabase.from("billing_subscriptions").upsert(
    {
      user_id: input.user_id,
      email: input.email,
      subscription_id: input.subscription_id,
      customer_id: input.customer_id,
      checkout_session_id: input.checkout_session_id ?? null,
      status: input.status,
      price_id: input.price_id,
      product_id: input.product_id,
      plan_key: input.plan_key ?? "pro",
      current_period_start: input.current_period_start,
      current_period_end: input.current_period_end,
      cancel_at_period_end: input.cancel_at_period_end,
      metadata: input.metadata ?? {},
      updated_at: new Date().toISOString(),
    },
    { onConflict: "subscription_id" }
  );

  if (error) throw error;
}

async function upsertUserSubscription(input: {
  user_id: string;
  email: string | null;
  plan: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}) {
  const { error } = await supabase.from("user_subscriptions").upsert(
    {
      user_id: input.user_id,
      email: input.email,
      plan: input.plan,
      status: input.status,
      stripe_customer_id: input.stripe_customer_id,
      stripe_subscription_id: input.stripe_subscription_id,
      stripe_price_id: input.stripe_price_id,
      current_period_end: input.current_period_end,
      cancel_at_period_end: input.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
}

function toIso(ts?: number | null) {
  if (!ts) return null;
  return new Date(ts * 1000).toISOString();
}

async function syncSubscription(subscriptionId: string, checkoutSession?: Stripe.Checkout.Session | null) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price.product", "customer"],
  });

  const item = subscription.items.data[0];
  const price = item?.price ?? null;
  const product =
    typeof price?.product === "string"
      ? price.product
      : (price?.product as Stripe.Product | null)?.id ?? null;

  const sessionUserId =
    (checkoutSession?.client_reference_id as string | null) ||
    (checkoutSession?.metadata?.user_id as string | null) ||
    null;

  const subUserId =
    (subscription.metadata?.user_id as string | null) ||
    sessionUserId ||
    null;

  const email =
    (checkoutSession?.customer_details?.email as string | null) ||
    (subscription.metadata?.email as string | null) ||
    ((subscription.customer as Stripe.Customer | null)?.email ?? null);

  await upsertBillingSubscription({
    user_id: subUserId,
    email,
    subscription_id: subscription.id,
    customer_id:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null,
    checkout_session_id: checkoutSession?.id ?? null,
    status: subscription.status,
    price_id: price?.id ?? null,
    product_id: product,
    plan_key: subscription.metadata?.plan || "pro",
    current_period_start: toIso((subscription as any).current_period_start ?? null),
    current_period_end: toIso((subscription as any).current_period_end ?? null),
    cancel_at_period_end: !!subscription.cancel_at_period_end,
    metadata: subscription.metadata ?? {},
  });

  if (subUserId) {
    const activeStatuses = new Set(["trialing", "active", "past_due", "unpaid"]);
    await upsertUserSubscription({
      user_id: subUserId,
      email,
      plan: subscription.metadata?.plan || "pro",
      status: activeStatuses.has(subscription.status) ? "active" : subscription.status,
      stripe_customer_id:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id ?? null,
      stripe_subscription_id: subscription.id,
      stripe_price_id: price?.id ?? null,
      current_period_end: toIso((subscription as any).current_period_end ?? null),
      cancel_at_period_end: !!subscription.cancel_at_period_end,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (subscriptionId) {
          await syncSubscription(subscriptionId, session);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription.id, null);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[stripe webhook error]", err);
    return NextResponse.json(
      { error: err?.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}
