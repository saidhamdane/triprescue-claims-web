import SiteNavbar from '../../components/SiteNavbar';
import SiteFooter from '../../components/SiteFooter';

function PlanCard({
  name,
  price,
  description,
  features,
  primary,
  badge,
  plan,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  primary?: boolean;
  badge?: string;
  plan?: string;
}) {
  return (
    <div
      style={{
        border: primary ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
        borderRadius: 24,
        padding: 26,
        background: primary ? 'linear-gradient(180deg,#ffffff,#f8fbff)' : '#fff',
        boxShadow: primary ? '0 20px 50px rgba(37,99,235,0.12)' : '0 10px 28px rgba(15,23,42,0.05)',
        position: 'relative',
      }}
    >
      {badge ? (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            padding: '6px 10px',
            borderRadius: 999,
            background: '#dbeafe',
            color: '#1d4ed8',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {badge}
        </div>
      ) : null}

      <div style={{ color: '#0f172a', fontWeight: 800, fontSize: 22 }}>{name}</div>
      <div style={{ color: '#0f172a', fontWeight: 900, fontSize: 42, marginTop: 10 }}>{price}</div>
      <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: 15, minHeight: 56 }}>{description}</p>

      <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
        {features.map((f) => (
          <div key={f} style={{ color: '#334155', fontSize: 14 }}>
            • {f}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        {plan ? (
          <form method="POST" action="/api/stripe/checkout">
            <input type="hidden" name="plan" value={plan} />
            <button
              type="submit"
              style={{
                width: '100%',
                border: 'none',
                cursor: 'pointer',
                background: primary ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : '#0f172a',
                color: '#fff',
                padding: '14px 18px',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {primary ? 'Upgrade now' : `Choose ${name}`}
            </button>
          </form>
        ) : (
          <a
            href="/dashboard/claims"
            style={{
              display: 'block',
              textDecoration: 'none',
              textAlign: 'center',
              background: '#fff',
              color: '#0f172a',
              padding: '14px 18px',
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 14,
              border: '1px solid #d1d5db',
            }}
          >
            Start free
          </a>
        )}
      </div>
    </div>
  );
}

function CompareRow({
  label,
  free,
  pro,
  premium,
}: {
  label: string;
  free: string;
  pro: string;
  premium: string;
}) {
  return (
    <tr>
      <td style={tdLabel}>{label}</td>
      <td style={tdCell}>{free}</td>
      <td style={tdCell}>{pro}</td>
      <td style={tdCell}>{premium}</td>
    </tr>
  );
}

export default function PricingPage() {
  return (
    <>
      <SiteNavbar />
      <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '70px 18px 32px' }}>
          <div style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 999,
                background: '#dbeafe',
                color: '#1d4ed8',
                fontWeight: 800,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              Pricing built for conversion
            </div>
            <h1 style={{ color: '#0f172a', fontSize: 52, margin: 0, lineHeight: 1.06 }}>
              Choose the plan that matches your travel claim workflow
            </h1>
            <p style={{ color: '#64748b', fontSize: 18, lineHeight: 1.9, marginTop: 16 }}>
              Start for free, generate claim drafts, then upgrade to unlock direct sending,
              evidence packaging, and a stronger operational workflow.
            </p>
          </div>

          <div
            style={{
              marginTop: 34,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
              alignItems: 'stretch',
            }}
          >
            <PlanCard
              name="Free"
              price="€0"
              description="For initial claim drafting and basic evidence preparation."
              features={[
                'AI claim letter generation',
                'Basic evidence packaging',
                'Single-user workflow',
              ]}
            />

            <PlanCard
              name="Pro"
              price="€19/mo"
              description="The fastest way to unlock direct email claim delivery and tracking."
              primary
              badge="Most Popular"
              plan="pro"
              features={[
                'Send claims by email',
                'Attachment support',
                'Claims dashboard',
                'Status tracking',
                'Operational claim workflow',
              ]}
            />

            <PlanCard
              name="Premium"
              price="€49/mo"
              description="For higher-touch workflows, escalations, and more advanced support needs."
              plan="premium"
              features={[
                'Everything in Pro',
                'Follow-up workflows',
                'Escalation-ready setup',
                'Priority support',
                'Commercial-grade usage',
              ]}
            />
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 18px 80px' }}>
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 24,
              background: '#fff',
              boxShadow: '0 10px 28px rgba(15,23,42,0.05)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 24, borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: 28 }}>Feature comparison</h2>
              <p style={{ color: '#64748b', lineHeight: 1.8, marginTop: 10 }}>
                Compare what each plan unlocks operationally.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 840 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={th}>Feature</th>
                    <th style={th}>Free</th>
                    <th style={th}>Pro</th>
                    <th style={th}>Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <CompareRow label="AI claim drafting" free="Yes" pro="Yes" premium="Yes" />
                  <CompareRow label="Evidence packaging" free="Basic" pro="Advanced" premium="Advanced" />
                  <CompareRow label="Send by email" free="No" pro="Yes" premium="Yes" />
                  <CompareRow label="Claim status tracking" free="No" pro="Yes" premium="Yes" />
                  <CompareRow label="Follow-up workflows" free="No" pro="No" premium="Yes" />
                  <CompareRow label="Priority support" free="No" pro="No" premium="Yes" />
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '16px 18px',
  color: '#334155',
  fontSize: 14,
  fontWeight: 800,
  borderBottom: '1px solid #e2e8f0',
};

const tdLabel: React.CSSProperties = {
  padding: '16px 18px',
  color: '#0f172a',
  fontWeight: 700,
  borderBottom: '1px solid #e2e8f0',
};

const tdCell: React.CSSProperties = {
  padding: '16px 18px',
  color: '#475569',
  borderBottom: '1px solid #e2e8f0',
};
