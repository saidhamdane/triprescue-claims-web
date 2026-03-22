import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function toIsoFromUnix(value?: number | null) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function planKeyFromPrice(priceId?: string | null) {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_PREMIUM) return 'premium';
  return null;
}

async function upsertSubscription(subscription: Stripe.Subscription, extra?: {
  checkoutSessionId?: string | null;
  email?: string | null;
}) {
  const item = subscription.items.data?.[0];
  const priceId = item?.price?.id || null;
  const productId =
    typeof item?.price?.product === 'string'
      ? item.price.product
      : item?.price?.product?.id || null;

  const payload = {
    subscription_id: subscription.id,
    customer_id:
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id || null,
    checkout_session_id: extra?.checkoutSessionId || null,
    email: extra?.email || null,
    status: subscription.status,
    price_id: priceId,
    product_id: productId,
    plan_key: planKeyFromPrice(priceId),
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    current_period_start: null,
    current_period_end: null,
    metadata: subscription.metadata || {},
  };

  const { error } = await supabase
    .from('billing_subscriptions')
    .upsert(payload, { onConflict: 'subscription_id' });

  if (error) throw error;
}

async function markSubscriptionCanceled(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('billing_subscriptions')
    .update({
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      current_period_start: null,
      current_period_end: null,
      metadata: subscription.metadata || {},
    })
    .eq('subscription_id', subscription.id);

  if (error) throw error;
}

export async function POST(req: NextRequest) {
  try {
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Missing STRIPE_WEBHOOK_SECRET' },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase server environment variables' },
        { status: 500 }
      );
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === 'subscription' && session.subscription) {
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await upsertSubscription(subscription, {
          checkoutSessionId: session.id,
          email: session.customer_details?.email || session.customer_email || null,
        });
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscription(subscription);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      await markSubscriptionCanceled(subscription);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Webhook failed' },
      { status: 400 }
    );
  }
}
