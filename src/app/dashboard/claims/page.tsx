import type { CSSProperties } from 'react';
import { createClient } from '@supabase/supabase-js';
import SiteNavbar from '../../../components/SiteNavbar';
import SiteFooter from '../../../components/SiteFooter';

export const dynamic = 'force-dynamic';

function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  tone?: 'default' | 'green' | 'blue' | 'amber';
}) {
  const toneMap = {
    default: {
      bg: '#ffffff',
      border: '#e2e8f0',
      value: '#0f172a',
      label: '#64748b',
    },
    green: {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      value: '#166534',
      label: '#15803d',
    },
    blue: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      value: '#1d4ed8',
      label: '#2563eb',
    },
    amber: {
      bg: '#fffbeb',
      border: '#fde68a',
      value: '#92400e',
      label: '#b45309',
    },
  }[tone];

  return (
    <div
      style={{
        border: `1px solid ${toneMap.border}`,
        borderRadius: 20,
        background: toneMap.bg,
        padding: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
      }}
    >
      <div style={{ color: toneMap.label, fontSize: 13, fontWeight: 700 }}>{label}</div>
      <div style={{ color: toneMap.value, fontSize: 30, fontWeight: 900, marginTop: 10 }}>
        {value}
      </div>
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

  const tone = map[status] || { bg: '#e2e8f0', color: '#334155' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        background: tone.bg,
        color: tone.color,
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  );
}

function ActionCard({
  title,
  text,
  href,
}: {
  title: string;
  text: string;
  href: string;
}) {
  return (
    <a
      href={href}
      style={{
        textDecoration: 'none',
        border: '1px solid #e2e8f0',
        borderRadius: 18,
        background: '#fff',
        padding: 18,
        boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
        display: 'block',
      }}
    >
      <div style={{ color: '#0f172a', fontWeight: 800, fontSize: 16 }}>{title}</div>
      <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginTop: 8 }}>{text}</div>
    </a>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        border: '1px dashed #cbd5e1',
        borderRadius: 22,
        background: '#fff',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <div style={{ color: '#0f172a', fontWeight: 900, fontSize: 24 }}>No claims sent yet</div>
      <div style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, marginTop: 10 }}>
        Once you send claim packages by email, this dashboard will show delivery status,
        recipients, attachments, and timestamps.
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
        <a
          href="/pricing"
          style={{
            textDecoration: 'none',
            background: '#111827',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: 14,
            fontWeight: 800,
          }}
        >
          View Pricing
        </a>
        <a
          href="/upgrade"
          style={{
            textDecoration: 'none',
            background: '#fff',
            color: '#111827',
            padding: '12px 18px',
            borderRadius: 14,
            fontWeight: 800,
            border: '1px solid #d1d5db',
          }}
        >
          Upgrade to Pro
        </a>
      </div>
    </div>
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

  const totalClaims = rows.length;
  const sentCount = rows.filter((r: any) => r.send_status === 'sent').length;
  const failedCount = rows.filter((r: any) => r.send_status === 'failed').length;
  const totalAttachments = rows.reduce((sum: number, r: any) => sum + (r.attachments_count || 0), 0);

  return (
    <>
      <SiteNavbar />
      <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '42px 18px 24px' }}>
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 28,
              padding: 28,
              background: 'linear-gradient(135deg,#0f172a,#111827)',
              boxShadow: '0 20px 50px rgba(15,23,42,0.16)',
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
                    fontWeight: 800,
                    fontSize: 13,
                    marginBottom: 14,
                  }}
                >
                  Claims operations
                </div>

                <h1 style={{ margin: 0, color: '#fff', fontSize: 42, lineHeight: 1.08 }}>
                  Claims Dashboard
                </h1>

                <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.9, marginTop: 14 }}>
                  Monitor delivery status, recipients, attachment counts, and claim sending activity
                  from one operational view.
                </p>
              </div>

              <div
                style={{
                  border: '1px solid rgba(148,163,184,0.14)',
                  borderRadius: 22,
                  background: 'rgba(255,255,255,0.04)',
                  padding: 18,
                }}
              >
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 12 }}>
                  Quick actions
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  <a href="/pricing" style={quickBtn}>
                    View pricing
                  </a>
                  <a href="/upgrade" style={quickBtnSecondary}>
                    Upgrade workflow
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '0 18px 22px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            <StatCard label="Total Claims" value={totalClaims} />
            <StatCard label="Sent" value={sentCount} tone="green" />
            <StatCard label="Failed" value={failedCount} tone="amber" />
            <StatCard label="Total Attachments" value={totalAttachments} tone="blue" />
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '0 18px 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            <ActionCard
              href="/pricing"
              title="Commercial view"
              text="Check the plan structure and current upgrade path for premium sending workflows."
            />
            <ActionCard
              href="/upgrade"
              title="Unlock sending"
              text="Guide free users to a Pro billing path that unlocks direct claim delivery."
            />
            <ActionCard
              href="/billing/success"
              title="Billing state"
              text="Use the billing success flow as the premium confirmation experience after checkout."
            />
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: '0 auto', padding: '0 18px 72px' }}>
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 24,
              background: '#fff',
              boxShadow: '0 10px 28px rgba(15,23,42,0.05)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: 24,
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ color: '#0f172a', fontWeight: 800, fontSize: 24 }}>Recent claim activity</div>
                <div style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
                  Latest sent claims, recipients, attachments, and delivery outcomes.
                </div>
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Live operational view
              </div>
            </div>

            {rows.length === 0 ? (
              <div style={{ padding: 24 }}>
                <EmptyState />
              </div>
            ) : (
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
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row: any) => (
                      <tr key={row.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={tdMono}>{row.incident_id}</td>
                        <td style={td}>{row.recipient_email}</td>
                        <td style={td}>{row.subject}</td>
                        <td style={td}>{row.attachments_count || 0}</td>
                        <td style={td}>
                          <StatusBadge status={row.send_status || 'draft'} />
                        </td>
                        <td style={td}>{row.sent_at || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const quickBtn: CSSProperties = {
  textDecoration: 'none',
  background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: 14,
  fontWeight: 800,
  textAlign: 'center',
};

const quickBtnSecondary: CSSProperties = {
  textDecoration: 'none',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: 14,
  fontWeight: 800,
  textAlign: 'center',
  border: '1px solid rgba(148,163,184,0.16)',
};

const th: CSSProperties = {
  textAlign: 'left',
  padding: '16px 18px',
  color: '#334155',
  fontSize: 13,
  fontWeight: 800,
  borderBottom: '1px solid #e2e8f0',
};

const td: CSSProperties = {
  padding: '16px 18px',
  color: '#111827',
  fontSize: 14,
  verticalAlign: 'top',
};

const tdMono: CSSProperties = {
  ...td,
  fontFamily: 'monospace',
  fontSize: 12,
  color: '#334155',
};
