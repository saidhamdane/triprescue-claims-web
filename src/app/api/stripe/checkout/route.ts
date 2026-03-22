import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

const PRICE_MAP: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};

async function readPlan(req: NextRequest): Promise<string> {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    return String(body?.plan || '').toLowerCase();
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const form = await req.formData().catch(() => null);
    return String(form?.get('plan') || '').toLowerCase();
  }

  return String(req.nextUrl.searchParams.get('plan') || '').toLowerCase();
}

export async function GET(req: NextRequest) {
  try {
    const plan = await readPlan(req);
    const price = PRICE_MAP[plan];

    if (!price) {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel`,
      allow_promotion_codes: true,
      metadata: {
        plan,
        source: 'pricing-page',
      },
    });

    if (!session.url) {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }

    return NextResponse.redirect(session.url, 303);
  } catch {
    return NextResponse.redirect(new URL('/pricing', req.url), 303);
  }
}

export async function POST(req: NextRequest) {
  try {
    const plan = await readPlan(req);
    const price = PRICE_MAP[plan];

    if (!price) {
      return NextResponse.json(
        { error: 'Invalid or missing plan price configuration' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel`,
      allow_promotion_codes: true,
      metadata: {
        plan,
        source: 'pricing-page',
      },
    });

    const accept = req.headers.get('accept') || '';
    const contentType = req.headers.get('content-type') || '';

    const isBrowserForm =
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data') ||
      accept.includes('text/html');

    if (isBrowserForm && session.url) {
      return NextResponse.redirect(session.url, 303);
    }

    return NextResponse.json({
      ok: true,
      url: session.url,
      id: session.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
