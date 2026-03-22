import SiteNavbar from '../../components/SiteNavbar';
import SiteFooter from '../../components/SiteFooter';

export default function UpgradePage() {
  return (
    <>
      <SiteNavbar />
      <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 16px' }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 24,
              padding: 32,
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 999,
                background: '#eef2ff',
                color: '#3730a3',
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              Upgrade Required
            </div>

            <h1 style={{ fontSize: 40, margin: 0, color: '#111827' }}>
              Upgrade to Pro to send claims by email
            </h1>

            <p style={{ color: '#6b7280', fontSize: 16, lineHeight: 1.8, marginTop: 16 }}>
              The Free plan lets you generate and review claim letters. Upgrade to Pro to send
              claim packages directly by email, manage attachments, and track outcomes from your dashboard.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              <a
                href="/api/stripe/checkout?plan=pro"
                style={{
                  textDecoration: 'none',
                  background: '#111827',
                  color: '#fff',
                  padding: '14px 20px',
                  borderRadius: 14,
                  fontWeight: 700,
                }}
              >
                Upgrade to Pro
              </a>

              <a
                href="/pricing"
                style={{
                  textDecoration: 'none',
                  background: '#fff',
                  color: '#111827',
                  padding: '14px 20px',
                  borderRadius: 14,
                  fontWeight: 700,
                  border: '1px solid #d1d5db',
                }}
              >
                Compare Plans
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
