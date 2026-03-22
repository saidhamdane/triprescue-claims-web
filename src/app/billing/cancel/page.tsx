import SiteNavbar from '../../../components/SiteNavbar';
import SiteFooter from '../../../components/SiteFooter';

export default function BillingCancelPage() {
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
                background: '#fef3c7',
                color: '#92400e',
                fontWeight: 800,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              Checkout canceled
            </div>

            <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.08, color: '#0f172a' }}>
              Your upgrade was not completed
            </h1>

            <p style={{ color: '#64748b', fontSize: 17, lineHeight: 1.9, marginTop: 16 }}>
              No worries. You can continue using the free workflow for drafting, then upgrade later
              whenever you want to unlock sending and tracking.
            </p>

            <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
              <CancelRow text="Continue generating claim drafts for free" />
              <CancelRow text="Return later to unlock direct email sending" />
              <CancelRow text="Compare plans again before upgrading" />
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 26 }}>
              <a
                href="/pricing"
                style={{
                  textDecoration: 'none',
                  background: '#111827',
                  color: '#fff',
                  padding: '14px 20px',
                  borderRadius: 14,
                  fontWeight: 800,
                }}
              >
                Return to Pricing
              </a>

              <a
                href="/dashboard/claims"
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
                Open Dashboard
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function CancelRow({ text }: { text: string }) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 14,
        color: '#334155',
        fontSize: 14,
      }}
    >
      • {text}
    </div>
  );
}
