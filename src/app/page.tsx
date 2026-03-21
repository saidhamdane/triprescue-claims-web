import SiteNavbar from '../components/SiteNavbar';
import SiteFooter from '../components/SiteFooter';

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 20,
        padding: 24,
        background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: 20, color: '#111827' }}>{title}</h3>
      <p style={{ color: '#6b7280', lineHeight: 1.7 }}>{text}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteNavbar />
      <main style={{ background: '#f9fafb', minHeight: '100vh' }}>
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 16px 40px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 32,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: '#e0e7ff',
                  color: '#3730a3',
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 18,
                }}
              >
                Travel Claims Platform
              </div>
              <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: 0, color: '#111827', fontWeight: 900 }}>
                Recover travel compensation faster with TripRescue AI
              </h1>
              <p style={{ fontSize: 18, color: '#6b7280', lineHeight: 1.8, marginTop: 18 }}>
                Generate claim letters, attach supporting evidence, send professional emails,
                and track every claim in one place.
              </p>

              <div style={{ display: 'flex', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
                <a
                  href="/dashboard/claims"
                  style={{
                    textDecoration: 'none',
                    background: '#111827',
                    color: '#fff',
                    padding: '14px 20px',
                    borderRadius: 14,
                    fontWeight: 700,
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
                    fontWeight: 700,
                    border: '1px solid #d1d5db',
                  }}
                >
                  View Pricing
                </a>
              </div>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 24,
                padding: 24,
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16, color: '#111827' }}>
                Why teams choose TripRescue AI
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#6b7280', lineHeight: 2 }}>
                <li>Claim generation in seconds</li>
                <li>Evidence uploads and attachments</li>
                <li>Email delivery with tracking</li>
                <li>Dashboard for sent claims and statuses</li>
                <li>Built for travel claims and escalation workflows</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 64px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            <FeatureCard
              title="AI claim letters"
              text="Generate structured claim letters for delays, lost baggage, cancellations, and more."
            />
            <FeatureCard
              title="Evidence handling"
              text="Upload and send supporting files with your claim package in a clean, professional flow."
            />
            <FeatureCard
              title="Delivery tracking"
              text="Track sent emails, attachment counts, claim statuses, and outcomes from one dashboard."
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
