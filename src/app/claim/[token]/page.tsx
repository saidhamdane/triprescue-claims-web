import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { getPublicClaim } from '../../../lib/get-public-claim';
import ClaimView from '../../../components/ClaimView';
import ErrorView from '../../../components/ErrorView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface PageProps {
  params: { token: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data } = await getPublicClaim(params.token);
  if (!data) return { title: 'TripRescue — Claim Not Found' };

  return {
    title: `TripRescue — ${data.incident.title}`,
    description: `${data.incident.type.replace(/_/g, ' ')} claim`,
  };
}

function TopBar() {
  return (
    <div
      style={{
        borderBottom: '1px solid rgba(148,163,184,0.12)',
        background: '#0b1220',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            T
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>TripRescue AI</div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>Premium travel claims workflow</div>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            padding: '8px 12px',
            borderRadius: 999,
            background: 'rgba(37,99,235,0.14)',
            color: '#93c5fd',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          Secure public claim view
        </div>
      </div>
    </div>
  );
}

function Hero({
  title,
  type,
  status,
  airline,
  flightNumber,
}: {
  title: string;
  type: string;
  status: string;
  airline?: string | null;
  flightNumber?: string | null;
}) {
  const chip = (label: string) => (
    <span
      style={{
        display: 'inline-block',
        padding: '8px 12px',
        borderRadius: 999,
        border: '1px solid rgba(148,163,184,0.14)',
        background: 'rgba(255,255,255,0.04)',
        color: '#cbd5e1',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );

  return (
    <section
      style={{
        background: 'linear-gradient(135deg,#020617,#0f172a)',
        borderBottom: '1px solid rgba(148,163,184,0.10)',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '34px 18px 36px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 22,
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
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              Public claim workspace
            </div>

            <h1
              style={{
                margin: 0,
                color: '#fff',
                fontSize: 40,
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
              }}
            >
              {title || 'Travel claim'}
            </h1>

            <p
              style={{
                color: '#94a3b8',
                fontSize: 16,
                lineHeight: 1.85,
                marginTop: 14,
                maxWidth: 760,
              }}
            >
              Review incident details, supporting evidence, AI-assisted claim drafting, and sending
              actions from one secure claim page.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
              {chip(`Type: ${type.replace(/_/g, ' ')}`)}
              {chip(`Status: ${status}`)}
              {airline ? chip(`Airline: ${airline}`) : null}
              {flightNumber ? chip(`Flight: ${flightNumber}`) : null}
            </div>
          </div>

          <div
            style={{
              border: '1px solid rgba(148,163,184,0.14)',
              borderRadius: 24,
              background: 'rgba(255,255,255,0.04)',
              padding: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 14 }}>
              Why this page matters
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                'Secure token-based claim access',
                'AI-assisted draft generation',
                'Evidence packaging and attachments',
                'Direct delivery workflow for paid plans',
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(148,163,184,0.10)',
                    color: '#cbd5e1',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const itemStyle: CSSProperties = {
    color: '#475569',
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'center',
  };

  return (
    <section style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '16px 18px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        <div style={itemStyle}>AI-assisted claim drafting</div>
        <div style={itemStyle}>Professional evidence packaging</div>
        <div style={itemStyle}>Direct sending for paid plans</div>
        <div style={itemStyle}>Built for modern travel support workflows</div>
      </div>
    </section>
  );
}

export default async function ClaimPage({ params }: PageProps) {
  const { token } = params;
  if (!token) return <ErrorView message="No claim token provided" />;

  const { data, error } = await getPublicClaim(token);
  if (error || !data) return <ErrorView message={error || 'Claim not found'} />;

  return (
    <>
      <TopBar />
      <Hero
        title={data.incident.title}
        type={data.incident.type}
        status={data.incident.status}
        airline={data.incident.airline}
        flightNumber={data.incident.flight_number}
      />
      <TrustStrip />
      <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 18px 72px' }}>
          <ClaimView data={data} />
        </div>
      </div>
    </>
  );
}
