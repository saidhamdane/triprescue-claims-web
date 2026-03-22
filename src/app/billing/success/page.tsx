import SiteNavbar from '../../../components/SiteNavbar';
import SiteFooter from '../../../components/SiteFooter';

export default function BillingSuccessPage() {
  return (
    <>
      <SiteNavbar />
      <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '72px 18px' }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 28,
              padding: 34,
              boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 999,
                background: '#dcfce7',
                color: '#166534',
                fontWeight: 800,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              Subscription active
            </div>

            <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.08, color: '#0f172a' }}>
              Your Pro access is now active
            </h1>

            <p style={{ color: '#64748b', fontSize: 17, lineHeight: 1.9, marginTop: 16 }}>
              You can now send claims by email, attach supporting files, and use the dashboard as a
              more complete premium workflow.
            </p>

            <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
              <InfoRow label="Billing status" value="Active" tone="green" />
              <InfoRow label="Plan access" value="Pro enabled" tone="blue" />
              <InfoRow label="Next step" value="Open dashboard and send a claim" tone="slate" />
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 26 }}>
              <a
                href="/dashboard/claims"
                style={{
                  textDecoration: 'none',
                  background: '#111827',
                  color: '#fff',
                  padding: '14px 20px',
                  borderRadius: 14,
                  fontWeight: 800,
                }}
              >
                Open Dashboard
              </a>

              <a
                href="/pricing"
                style={{
                  textDecoration: 'none',
                  background: '#fff',
                  color: '#111827',
                  padding: '14px 20px',
                  borderRadius: 14,
                  fontWeight: 800,
                  border: '1px solid #d1d5db',
                }}
              >
                View Pricing
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function InfoRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'green' | 'blue' | 'slate';
}) {
  const toneMap = {
    green: { bg: '#dcfce7', color: '#166534' },
    blue: { bg: '#dbeafe', color: '#1d4ed8' },
    slate: { bg: '#e2e8f0', color: '#334155' },
  }[tone];

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 14,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <div style={{ color: '#334155', fontSize: 14 }}>{label}</div>
      <div
        style={{
          padding: '6px 10px',
          borderRadius: 999,
          background: toneMap.bg,
          color: toneMap.color,
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        {value}
      </div>
    </div>
  );
}
