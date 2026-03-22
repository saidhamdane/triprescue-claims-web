'use client';

import { useState } from 'react';
import SiteNavbar from '../../components/SiteNavbar';
import SiteFooter from '../../components/SiteFooter';

function CheckoutButton({
  plan,
  label,
  featured = false,
}: {
  plan: 'pro' | 'premium';
  label: string;
  featured?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(payload?.error || 'Checkout failed');
        return;
      }

      if (payload?.url) {
        window.location.href = payload.url;
        return;
      }

      alert('No checkout URL returned');
    } catch (e: any) {
      alert(e?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      style={{
        marginTop: 18,
        border: featured ? '1px solid #111827' : '1px solid #d1d5db',
        background: featured ? '#111827' : '#fff',
        color: featured ? '#fff' : '#111827',
        borderRadius: 14,
        padding: '12px 18px',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {loading ? 'Redirecting...' : label}
    </button>
  );
}

function PlanCard({
  title,
  price,
  features,
  featured = false,
  cta,
}: {
  title: string;
  price: string;
  features: string[];
  featured?: boolean;
  cta?: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: featured ? '2px solid #111827' : '1px solid #e5e7eb',
        borderRadius: 22,
        padding: 24,
        background: '#fff',
        boxShadow: featured ? '0 10px 30px rgba(0,0,0,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <h2 style={{ marginTop: 0, color: '#111827' }}>{title}</h2>
      <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 16, color: '#111827' }}>{price}</div>
      <ul style={{ paddingLeft: 18, color: '#6b7280', lineHeight: 2 }}>
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      {cta}
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <SiteNavbar />
      <main style={{ background: '#f9fafb', minHeight: '100vh' }}>
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 42, margin: 0, color: '#111827' }}>Pricing</h1>
            <p style={{ color: '#6b7280', fontSize: 18 }}>
              Choose the plan that fits your claim volume and workflow.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            <PlanCard
              title="Free"
              price="€0"
              features={[
                'Generate claim letters',
                'Basic evidence packaging',
                'Single-user access',
              ]}
              cta={
                <a
                  href="/"
                  style={{
                    display: 'inline-block',
                    marginTop: 18,
                    textDecoration: 'none',
                    background: '#fff',
                    color: '#111827',
                    border: '1px solid #d1d5db',
                    borderRadius: 14,
                    padding: '12px 18px',
                    fontWeight: 700,
                  }}
                >
                  Start Free
                </a>
              }
            />

            <PlanCard
              title="Pro"
              price="€19/mo"
              featured
              features={[
                'Send claims by email',
                'Attachment support',
                'Claims dashboard',
                'Status tracking',
              ]}
              cta={<CheckoutButton plan="pro" label="Upgrade to Pro" featured />}
            />

            <PlanCard
              title="Premium"
              price="€49/mo"
              features={[
                'Everything in Pro',
                'Follow-up workflows',
                'Escalation-ready setup',
                'Priority support',
              ]}
              cta={<CheckoutButton plan="premium" label="Upgrade to Premium" />}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
