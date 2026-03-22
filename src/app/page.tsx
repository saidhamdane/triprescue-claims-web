import SiteNavbar from '../components/SiteNavbar';
import SiteFooter from '../components/SiteFooter';
import Link from 'next/link';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        border: '1px solid rgba(148,163,184,0.16)',
        background: 'rgba(15,23,42,0.55)',
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div style={{ color: '#fff', fontWeight: 900, fontSize: 28 }}>{value}</div>
      <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        border: '1px solid rgba(148,163,184,0.16)',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 22,
        padding: 24,
        boxShadow: '0 10px 30px rgba(0,0,0,0.14)',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 10, color: '#fff', fontSize: 20 }}>{title}</h3>
      <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.8, fontSize: 15 }}>{text}</p>
    </div>
  );
}

function Step({
  index,
  title,
  text,
}: {
  index: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 22,
        padding: 24,
        background: '#fff',
        boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: '#eff6ff',
          color: '#1d4ed8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          marginBottom: 14,
        }}
      >
        {index}
      </div>
      <h3 style={{ margin: 0, color: '#0f172a', fontSize: 20 }}>{title}</h3>
      <p style={{ color: '#475569', lineHeight: 1.8, marginTop: 10 }}>{text}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteNavbar />

      <main style={{ background: '#020617', minHeight: '100vh' }}>
        <section
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '54px 18px 28px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 28,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: 'rgba(37,99,235,0.14)',
                  color: '#93c5fd',
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 18,
                  border: '1px solid rgba(37,99,235,0.2)',
                }}
              >
                Global travel claims SaaS
              </div>

              <h1
                style={{
                  margin: 0,
                  color: '#fff',
                  fontSize: 56,
                  lineHeight: 1.04,
                  fontWeight: 900,
                  maxWidth: 680,
                }}
              >
                Recover travel compensation faster with a premium claim workflow
              </h1>

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 18,
                  lineHeight: 1.9,
                  marginTop: 18,
                  maxWidth: 700,
                }}
              >
                Generate airline claim letters, organize supporting evidence, send claim packages
                professionally, and track outcomes from one modern dashboard designed for travelers,
                assistants, and travel support teams.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
                <Link
                  href="/pricing"
                  style={{
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                    color: '#fff',
                    padding: '15px 20px',
                    borderRadius: 14,
                    fontWeight: 800,
                    boxShadow: '0 18px 40px rgba(37,99,235,0.25)',
                  }}
                >
                  Start with Pro
                </Link>

                <Link
                  href="/dashboard/claims"
                  style={{
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    padding: '15px 20px',
                    borderRadius: 14,
                    fontWeight: 800,
                    border: '1px solid rgba(148,163,184,0.18)',
                  }}
                >
                  Open Dashboard
                </Link>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 12,
                  marginTop: 28,
                }}
              >
                <Stat value="AI" label="Letter drafting" />
                <Stat value="1-click" label="Upgrade flow" />
                <Stat value="Live" label="Claim tracking" />
              </div>
            </div>

            <div
              style={{
                border: '1px solid rgba(148,163,184,0.16)',
                borderRadius: 28,
                padding: 22,
                background: 'linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.58))',
                boxShadow: '0 30px 80px rgba(0,0,0,0.28)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <div style={miniCard}>
                  <div style={miniLabel}>Claim status</div>
                  <div style={miniValue}>Ready to send</div>
                </div>
                <div style={miniCard}>
                  <div style={miniLabel}>Plan access</div>
                  <div style={miniValue}>Pro enabled</div>
                </div>
              </div>

              <div style={mockPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Claims Overview</div>
                    <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                      Draft, send, track, and escalate from one workflow.
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: 999,
                      background: 'rgba(34,197,94,0.14)',
                      color: '#86efac',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Operational
                  </div>
                </div>

                <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
                  <div style={rowCard}>
                    <div>
                      <div style={rowTitle}>AI claim letter</div>
                      <div style={rowSub}>Delayed flight · baggage · cancellation</div>
                    </div>
                    <div style={badgeBlue}>Generated</div>
                  </div>

                  <div style={rowCard}>
                    <div>
                      <div style={rowTitle}>Evidence package</div>
                      <div style={rowSub}>Photos, tickets, receipts, itinerary</div>
                    </div>
                    <div style={badgeSlate}>Attached</div>
                  </div>

                  <div style={rowCard}>
                    <div>
                      <div style={rowTitle}>Email delivery</div>
                      <div style={rowSub}>Professional send flow with status updates</div>
                    </div>
                    <div style={badgeGreen}>Tracked</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '10px 18px 40px' }}>
          <div
            style={{
              border: '1px solid rgba(148,163,184,0.12)',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.03)',
              padding: '16px 18px',
              display: 'flex',
              gap: 22,
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <TrustItem text="Professional claim packaging" />
            <TrustItem text="Direct upgrade to paid plans" />
            <TrustItem text="Built for international travel cases" />
            <TrustItem text="Designed for modern support workflows" />
          </div>
        </section>

        <section style={{ background: '#f8fafc' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '72px 18px 28px' }}>
            <SectionHeader
              eyebrow="How it works"
              title="A clear claim workflow from draft to delivery"
              text="TripRescue AI turns fragmented travel incidents into a structured compensation process."
            />

            <div
              style={{
                marginTop: 28,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 18,
              }}
            >
              <Step
                index="1"
                title="Capture the incident"
                text="Collect trip details, baggage issues, delays, or cancellation events in a structured incident flow."
              />
              <Step
                index="2"
                title="Generate a stronger claim"
                text="Use AI-assisted drafting to turn raw incident details into a more professional compensation letter."
              />
              <Step
                index="3"
                title="Send and track"
                text="Upgrade to Pro to send claims by email and monitor the operational status from your dashboard."
              />
            </div>
          </div>

          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 18px 72px' }}>
            <SectionHeader
              eyebrow="Core capabilities"
              title="Designed like a premium B2B SaaS product"
              text="A cleaner user experience, better evidence handling, and stronger commercial positioning."
            />

            <div
              style={{
                marginTop: 28,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 18,
              }}
            >
              <FeatureLight
                title="AI claim drafting"
                text="Generate structured claim letters for delayed flights, lost baggage, disruption events, and compensation requests."
              />
              <FeatureLight
                title="Evidence handling"
                text="Collect and package supporting files in a more credible, client-ready workflow."
              />
              <FeatureLight
                title="Delivery tracking"
                text="Monitor claim sending activity, attachment counts, and operational outcomes from one dashboard."
              />
              <FeatureLight
                title="Upgrade flow"
                text="Move users from free drafting to paid sending with a clear, low-friction conversion path."
              />
            </div>
          </div>
        </section>


        <section style={{ background: '#ffffff' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 18px 72px' }}>
            <SectionHeader
              eyebrow="Use cases"
              title="Built for real travel support scenarios"
              text="The product is structured to work across direct traveler use, concierge-style support, and claim operations."
            />

            <div
              style={{
                marginTop: 28,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 18,
              }}
            >
              <UseCaseCard
                title="Individual travelers"
                text="Generate stronger letters, package evidence cleanly, and move from draft to delivery faster."
              />
              <UseCaseCard
                title="Travel assistants"
                text="Use TripRescue AI as an operational layer for drafting and coordinating multiple traveler incidents."
              />
              <UseCaseCard
                title="Claim support workflows"
                text="Track sending status, attachments, and outcomes with a more structured premium workflow."
              />
            </div>
          </div>
        </section>

        <section style={{ background: '#020617' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '72px 18px' }}>
            <SectionHeaderDark
              eyebrow="Why it feels premium"
              title="A calmer, cleaner, more credible user experience"
              text="The positioning is no longer just AI generation. It is now an operational travel claims product with commercial structure."
            />

            <div
              style={{
                marginTop: 28,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 18,
              }}
            >
              <Testimonial
                quote="The workflow feels structured enough to be used as a client-facing claim support process."
                role="Travel support operator"
              />
              <Testimonial
                quote="The upgrade path from drafting to direct sending is clear and commercially usable."
                role="SaaS growth perspective"
              />
              <Testimonial
                quote="The product feels much closer to a premium vertical SaaS than a generic AI tool."
                role="Commercial UX review"
              />
            </div>
          </div>
        </section>

        <section style={{ background: '#f8fafc' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '72px 18px' }}>
            <SectionHeader
              eyebrow="FAQ"
              title="Common questions before users upgrade"
              text="These answers reduce friction and make the pricing page easier to trust."
            />

            <div
              style={{
                marginTop: 28,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 18,
              }}
            >
              <FAQItem
                q="Can I start for free?"
                a="Yes. The Free plan allows users to generate claim drafts and prepare basic evidence before upgrading."
              />
              <FAQItem
                q="What does Pro unlock?"
                a="Pro unlocks direct claim sending by email, attachment support, dashboard visibility, and delivery tracking."
              />
              <FAQItem
                q="Who is this designed for?"
                a="TripRescue AI is suitable for individual travelers, assistants, and premium support workflows handling travel incidents."
              />
              <FAQItem
                q="Can users cancel later?"
                a="Yes. The subscription model is designed to support upgrades, cancellations, and future commercial refinement."
              />
            </div>
          </div>
        </section>


        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '72px 18px' }}>
          <div
            style={{
              borderRadius: 30,
              padding: 32,
              background: 'linear-gradient(135deg,#0f172a,#111827)',
              border: '1px solid rgba(148,163,184,0.14)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 24,
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: 'rgba(37,99,235,0.14)',
                    color: '#93c5fd',
                    fontWeight: 700,
                    fontSize: 13,
                    marginBottom: 14,
                  }}
                >
                  Ready to scale
                </div>
                <h2 style={{ color: '#fff', fontSize: 38, margin: 0, lineHeight: 1.15 }}>
                  Turn TripRescue AI into a real premium travel claims SaaS
                </h2>
                <p style={{ color: '#94a3b8', lineHeight: 1.9, marginTop: 14, fontSize: 16 }}>
                  Start with free claim drafting, then unlock Pro to send claims by email and manage
                  delivery workflows professionally.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                <Link
                  href="/pricing"
                  style={{
                    textDecoration: 'none',
                    background: '#fff',
                    color: '#0f172a',
                    padding: '15px 20px',
                    borderRadius: 14,
                    fontWeight: 800,
                  }}
                >
                  View Pricing
                </Link>
                <Link
                  href="/upgrade"
                  style={{
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                    color: '#fff',
                    padding: '15px 20px',
                    borderRadius: 14,
                    fontWeight: 800,
                  }}
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 600 }}>
      {text}
    </div>
  );
}


function SectionHeaderDark({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div style={{ maxWidth: 760 }}>
      <div
        style={{
          color: '#60a5fa',
          fontWeight: 800,
          fontSize: 13,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        }}
      >
        {eyebrow}
      </div>
      <h2 style={{ margin: 0, color: '#fff', fontSize: 42, lineHeight: 1.1 }}>{title}</h2>
      <p style={{ color: '#94a3b8', lineHeight: 1.9, fontSize: 17, marginTop: 14 }}>{text}</p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div style={{ maxWidth: 760 }}>
      <div
        style={{
          color: '#2563eb',
          fontWeight: 800,
          fontSize: 13,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        }}
      >
        {eyebrow}
      </div>
      <h2 style={{ margin: 0, color: '#0f172a', fontSize: 42, lineHeight: 1.1 }}>{title}</h2>
      <p style={{ color: '#475569', lineHeight: 1.9, fontSize: 17, marginTop: 14 }}>{text}</p>
    </div>
  );
}

function FeatureLight({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        background: '#fff',
        borderRadius: 22,
        padding: 24,
        boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
      }}
    >
      <h3 style={{ margin: 0, color: '#0f172a', fontSize: 20 }}>{title}</h3>
      <p style={{ margin: '10px 0 0', color: '#475569', lineHeight: 1.8 }}>{text}</p>
    </div>
  );
}


function UseCaseCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        background: '#fff',
        borderRadius: 22,
        padding: 24,
        boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
      }}
    >
      <h3 style={{ margin: 0, color: '#0f172a', fontSize: 20 }}>{title}</h3>
      <p style={{ margin: '10px 0 0', color: '#475569', lineHeight: 1.8 }}>{text}</p>
    </div>
  );
}

function Testimonial({
  quote,
  role,
}: {
  quote: string;
  role: string;
}) {
  return (
    <div
      style={{
        border: '1px solid rgba(148,163,184,0.14)',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 22,
        padding: 24,
        boxShadow: '0 10px 30px rgba(0,0,0,0.14)',
      }}
    >
      <div style={{ color: '#e2e8f0', fontSize: 16, lineHeight: 1.9 }}>
        “{quote}”
      </div>
      <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 14 }}>{role}</div>
    </div>
  );
}

function FAQItem({
  q,
  a,
}: {
  q: string;
  a: string;
}) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        background: '#fff',
        borderRadius: 20,
        padding: 22,
        boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
      }}
    >
      <div style={{ color: '#0f172a', fontWeight: 800, fontSize: 18 }}>{q}</div>
      <div style={{ color: '#475569', lineHeight: 1.8, marginTop: 10 }}>{a}</div>
    </div>
  );
}


const miniCard: React.CSSProperties = {
  border: '1px solid rgba(148,163,184,0.14)',
  background: 'rgba(255,255,255,0.03)',
  borderRadius: 18,
  padding: 16,
};

const miniLabel: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: 12,
  marginBottom: 6,
};

const miniValue: React.CSSProperties = {
  color: '#fff',
  fontWeight: 800,
  fontSize: 16,
};

const mockPanel: React.CSSProperties = {
  border: '1px solid rgba(148,163,184,0.14)',
  background: 'rgba(2,6,23,0.56)',
  borderRadius: 24,
  padding: 20,
};

const rowCard: React.CSSProperties = {
  border: '1px solid rgba(148,163,184,0.12)',
  background: 'rgba(255,255,255,0.03)',
  borderRadius: 16,
  padding: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};

const rowTitle: React.CSSProperties = {
  color: '#fff',
  fontWeight: 700,
  fontSize: 15,
};

const rowSub: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: 13,
  marginTop: 4,
};

const badgeBlue: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: 999,
  background: 'rgba(37,99,235,0.16)',
  color: '#93c5fd',
  fontSize: 12,
  fontWeight: 700,
};

const badgeSlate: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: 999,
  background: 'rgba(148,163,184,0.14)',
  color: '#cbd5e1',
  fontSize: 12,
  fontWeight: 700,
};

const badgeGreen: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: 999,
  background: 'rgba(34,197,94,0.14)',
  color: '#86efac',
  fontSize: 12,
  fontWeight: 700,
};
