import SiteNavbar from '../../components/SiteNavbar';
import SiteFooter from '../../components/SiteFooter';

function PriceCard({
  name,
  price,
  points,
  primary,
  cta,
  href,
  badge,
}: {
  name: string;
  price: string;
  points: string[];
  primary?: boolean;
  cta: string;
  href: string;
  badge?: string;
}) {
  return (
    <div
      style={{
        border: primary ? '2px solid #111827' : '1px solid #e5e7eb',
        borderRadius: 20,
        padding: 24,
        background: '#fff',
        boxShadow: primary ? '0 10px 30px rgba(0,0,0,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div style={{ color: '#111827', fontWeight: 800, fontSize: 20 }}>{name}</div>
        {badge ? (
          <span
            style={{
              display: 'inline-block',
              padding: '6px 10px',
              borderRadius: 999,
              background: '#eef2ff',
              color: '#3730a3',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div style={{ fontSize: 36, fontWeight: 900, color: '#111827', margin: '10px 0 16px' }}>
        {price}
      </div>

      <ul style={{ paddingLeft: 18, color: '#6b7280', lineHeight: 2 }}>
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>

      <a
        href={href}
        style={{
          display: 'inline-block',
          marginTop: 18,
          textDecoration: 'none',
          background: primary ? '#111827' : '#fff',
          color: primary ? '#fff' : '#111827',
          padding: '12px 18px',
          borderRadius: 12,
          fontWeight: 700,
          border: primary ? 'none' : '1px solid #d1d5db',
        }}
      >
        {cta}
      </a>
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <SiteNavbar />
      <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontSize: 42, margin: 0, color: '#111827' }}>Pricing</h1>
            <p style={{ color: '#6b7280', fontSize: 16, marginTop: 12 }}>
              Choose the plan that fits your claim volume and workflow.
            </p>
            <div
              style={{
                marginTop: 18,
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 999,
                background: '#ecfeff',
                color: '#155e75',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Pro is the fastest way to unlock direct email claim delivery
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            <PriceCard
              name="Free"
              price="€0"
              points={[
                'Generate claim letters',
                'Basic evidence packaging',
                'Single-user access',
              ]}
              cta="Get Started"
              href="/dashboard/claims"
            />

            <PriceCard
              name="Pro"
              price="€19/mo"
              primary
              badge="Most Popular"
              points={[
                'Send claims by email',
                'Attachment support',
                'Claims dashboard',
                'Status tracking',
              ]}
              cta="Upgrade to Pro"
              href="/api/stripe/checkout?plan=pro"
            />

            <PriceCard
              name="Premium"
              price="€49/mo"
              points={[
                'Everything in Pro',
                'Follow-up workflows',
                'Escalation-ready setup',
                'Priority support',
              ]}
              cta="Go Premium"
              href="/api/stripe/checkout?plan=premium"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
