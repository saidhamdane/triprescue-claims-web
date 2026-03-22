import type { CSSProperties } from 'react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  tone?: 'default' | 'success' | 'warning' | 'info';
}) {
  const tones: Record<string, CSSProperties> = {
    default: { background: '#ffffff', border: '1px solid #e2e8f0' },
    success: { background: '#ecfdf5', border: '1px solid #bbf7d0' },
    warning: { background: '#fffbeb', border: '1px solid #fde68a' },
    info: { background: '#eff6ff', border: '1px solid #bfdbfe' },
  };

  return (
    <div
      style={{
        borderRadius: 18,
        padding: 18,
        boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
        ...tones[tone],
      }}
    >
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
        {value}
      </div>
    </div>
  );
}

function MiniCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        background: '#fff',
        padding: 16,
        boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    sent: { bg: '#dcfce7', color: '#166534' },
    failed: { bg: '#fee2e2', color: '#991b1b' },
    queued: { bg: '#fef3c7', color: '#92400e' },
    draft: { bg: '#e2e8f0', color: '#334155' },
    replied: { bg: '#dbeafe', color: '#1d4ed8' },
  };

  const style = map[status] || { bg: '#e2e8f0', color: '#334155' };

  return (
    <span
      style={{
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: style.bg,
        color: style.color,
        display: 'inline-block',
      }}
    >
      {status}
    </span>
  );
}

export default async function ClaimsDashboardPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: claims } = await supabase
    .from('claim_messages')
    .select('id, incident_id, recipient_email, subject, attachments_count, send_status, sent_at, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = claims || [];
  const incidentIds = Array.from(
  new Set(rows.map((r: any) => r.incident_id).filter(Boolean))
) as string[];

  let shareMap: Record<string, string> = {};
  if (incidentIds.length > 0) {
    const { data: shareLinks } = await supabase
      .from('share_links')
      .select('incident_id, token, created_at')
      .in('incident_id', incidentIds)
      .order('created_at', { ascending: false });

    for (const row of shareLinks || []) {
      if (row.incident_id && row.token && !shareMap[row.incident_id]) {
        shareMap[row.incident_id] = row.token;
      }
    }
  }

  const totalClaims = rows.length;
  const sentCount = rows.filter((r: any) => r.send_status === 'sent').length;
  const failedCount = rows.filter((r: any) => r.send_status === 'failed').length;
  const totalAttachments = rows.reduce((sum: number, r: any) => sum + (r.attachments_count || 0), 0);

  return (
    <main style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 16px 80px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <section
          style={{
            background: 'linear-gradient(135deg,#0b1220,#111827)',
            border: '1px solid rgba(148,163,184,0.16)',
            borderRadius: 28,
            padding: 24,
            boxShadow: '0 20px 50px rgba(2,6,23,0.28)',
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 18,
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(37,99,235,0.14)',
                  color: '#93c5fd',
                  fontSize: 12,
                  fontWeight: 800,
                  borderRadius: 999,
                  padding: '7px 11px',
                  marginBottom: 12,
                }}
              >
                Claims operations
              </div>

              <h1
                style={{
                  color: '#fff',
                  fontSize: 36,
                  lineHeight: 1.08,
                  margin: '0 0 10px',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                }}
              >
                Claims Dashboard
              </h1>

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 15,
                  lineHeight: 1.7,
                  margin: 0,
                  maxWidth: 640,
                }}
              >
                Monitor delivery status, recipients, attachments, and claim-link activity from one
                operational workspace.
              </p>
            </div>

            <div
              style={{
                borderRadius: 20,
                border: '1px solid rgba(148,163,184,0.12)',
                background: 'rgba(255,255,255,0.04)',
                padding: 16,
              }}
            >
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
                Quick actions
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <a
                  href="/pricing"
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    textAlign: 'center',
                    background: '#2563eb',
                    color: '#fff',
                    padding: '12px 14px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  View pricing
                </a>

                <a
                  href="/upgrade"
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#fff',
                    padding: '12px 14px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    border: '1px solid rgba(148,163,184,0.12)',
                  }}
                >
                  Upgrade workflow
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <StatCard label="Total Claims" value={totalClaims} />
          <StatCard label="Sent" value={sentCount} tone="success" />
          <StatCard label="Failed" value={failedCount} tone="warning" />
          <StatCard label="Total Attachments" value={totalAttachments} tone="info" />
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
            marginBottom: 22,
          }}
        >
          <MiniCard
            title="Commercial view"
            text="Check the plan structure and current upgrade path for premium claim workflows."
          />
          <MiniCard
            title="Unlock sending"
            text="Direct file delivery and email sending become much more valuable once Pro is enabled."
          />
          <MiniCard
            title="Billing state"
            text="Use the billing success flow and current plan confirmation experience after checkout."
          />
        </section>

        <section
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 10px 28px rgba(15,23,42,0.05)',
          }}
        >
          <div
            style={{
              padding: '18px 18px 12px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
                Recent claim activity
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Latest sent claims, recipients, attachments, delivery outcomes, and check links.
              </div>
            </div>

            <a
              href="/pricing"
              style={{
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
                color: '#2563eb',
              }}
            >
              Use operational view
            </a>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={th}>Incident</th>
                  <th style={th}>Recipient</th>
                  <th style={th}>Subject</th>
                  <th style={th}>Attachments</th>
                  <th style={th}>Status</th>
                  <th style={th}>Sent At</th>
                  <th style={th}>Token</th>
                  <th style={th}>Open</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any) => {
                  const token = shareMap[row.incident_id];
                  const href = token ? `https://claims.triprescue.site/claim/${token}` : '';

                  return (
                    <tr key={row.id} style={{ borderTop: '1px solid #eef2f7' }}>
                      <td style={tdMono}>{row.incident_id}</td>
                      <td style={td}>{row.recipient_email}</td>
                      <td style={td}>{row.subject}</td>
                      <td style={td}>{row.attachments_count}</td>
                      <td style={td}>
                        <StatusBadge status={row.send_status} />
                      </td>
                      <td style={td}>{row.sent_at || '-'}</td>
                      <td style={tdMono}>{token || 'NO_TOKEN'}</td>
                      <td style={td}>
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-block',
                              textDecoration: 'none',
                              border: 'none',
                              background: '#0f172a',
                              color: '#fff',
                              padding: '8px 12px',
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            Open
                          </a>
                        ) : (
                          <span
                            style={{
                              display: 'inline-block',
                              background: '#e2e8f0',
                              color: '#64748b',
                              padding: '8px 12px',
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          >
                            No link
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

const th: CSSProperties = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: 13,
  color: '#475569',
  fontWeight: 800,
};

const td: CSSProperties = {
  padding: '14px 16px',
  fontSize: 14,
  color: '#0f172a',
  verticalAlign: 'top',
};

const tdMono: CSSProperties = {
  ...td,
  fontFamily: 'monospace',
  fontSize: 12,
};
