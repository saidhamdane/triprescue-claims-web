import SiteNavbar from '../../components/SiteNavbar';
import SiteFooter from '../../components/SiteFooter';

export default function UpgradePage() {
  return (
    <>
      <SiteNavbar />
      <main style={{ minHeight: '100vh', background: '#020617' }}>
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 18px' }}>
          <div
            style={{
              border: '1px solid rgba(148,163,184,0.14)',
              borderRadius: 28,
              padding: 32,
              background: 'linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.72))',
              boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 999,
                background: 'rgba(37,99,235,0.14)',
                color: '#93c5fd',
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              Upgrade required
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 28,
                alignItems: 'center',
              }}
            >
              <div>
                <h1 style={{ fontSize: 44, lineHeight: 1.08, margin: 0, color: '#fff' }}>
                  Upgrade to Pro to send claims directly by email
                </h1>

                <p style={{ color: '#94a3b8', fontSize: 17, lineHeight: 1.9, marginTop: 16 }}>
                  The Free plan is built for drafting and preparation. Pro unlocks direct claim
                  delivery, attachment support, and a more professional workflow for real travel claim operations.
                </p>

                <div style={{ display: 'grid', gap: 12, marginTop: 22 }}>
                  <Benefit text="Direct claim sending by email" />
                  <Benefit text="Attachment support for claim packages" />
                  <Benefit text="Claims dashboard and status tracking" />
                  <Benefit text="Stronger commercial workflow for premium users" />
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 26 }}>
                  <form method="POST" action="/api/stripe/checkout">
                    <input type="hidden" name="plan" value="pro" />
                    <button
                      type="submit"
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                        color: '#fff',
                        padding: '14px 20px',
                        borderRadius: 14,
                        fontWeight: 800,
                        fontSize: 15,
                        boxShadow: '0 18px 40px rgba(37,99,235,0.25)',
                      }}
                    >
                      Upgrade to Pro
                    </button>
                  </form>

                  <a
                    href="/pricing"
                    style={{
                      textDecoration: 'none',
                      color: '#fff',
                      border: '1px solid rgba(148,163,184,0.2)',
                      padding: '14px 20px',
                      borderRadius: 14,
                      fontWeight: 800,
                      fontSize: 15,
                      background: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    Compare plans
                  </a>
                </div>
              </div>

              <div
                style={{
                  border: '1px solid rgba(148,163,184,0.14)',
                  borderRadius: 24,
                  background: 'rgba(255,255,255,0.03)',
                  padding: 20,
                }}
              >
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 14 }}>
                  What Pro unlocks
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  <MiniCard label="Claim drafting" value="Included" tone="slate" />
                  <MiniCard label="Evidence packaging" value="Included" tone="slate" />
                  <MiniCard label="Email delivery" value="Unlocked" tone="blue" />
                  <MiniCard label="Tracking workflow" value="Unlocked" tone="green" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Benefit({ text }: { text: string }) {
  return <div style={{ color: '#cbd5e1', fontSize: 15 }}>• {text}</div>;
}

function MiniCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'slate' | 'blue' | 'green';
}) {
  const toneMap = {
    slate: { bg: 'rgba(148,163,184,0.12)', color: '#cbd5e1' },
    blue: { bg: 'rgba(37,99,235,0.16)', color: '#93c5fd' },
    green: { bg: 'rgba(34,197,94,0.14)', color: '#86efac' },
  }[tone];

  return (
    <div
      style={{
        border: '1px solid rgba(148,163,184,0.12)',
        borderRadius: 16,
        padding: 14,
        background: 'rgba(2,6,23,0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <div style={{ color: '#e2e8f0', fontSize: 14 }}>{label}</div>
      <div
        style={{
          padding: '6px 10px',
          borderRadius: 999,
          background: toneMap.bg,
          color: toneMap.color,
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}
