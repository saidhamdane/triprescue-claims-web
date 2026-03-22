import type { CSSProperties } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: 20,
        background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    sent: { bg: '#dcfce7', color: '#166534' },
    failed: { bg: '#fee2e2', color: '#991b1b' },
    queued: { bg: '#fef3c7', color: '#92400e' },
    draft: { bg: '#e5e7eb', color: '#374151' },
    replied: { bg: '#dbeafe', color: '#1d4ed8' },
  };

  const style = map[status] || { bg: '#e5e7eb', color: '#374151' };

  return (
    <span
      style={{
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
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
  );

  let tokenMap = new Map<string, string>();

  if (incidentIds.length > 0) {
    const { data: links } = await supabase
      .from('share_links')
      .select('incident_id, token, created_at')
      .in('incident_id', incidentIds)
      .order('created_at', { ascending: false });

    for (const row of links || []) {
      if (row.incident_id && row.token && !tokenMap.has(row.incident_id)) {
        tokenMap.set(row.incident_id, row.token);
      }
    }
  }

  const totalClaims = rows.length;
  const sentCount = rows.filter((r: any) => r.send_status === 'sent').length;
  const failedCount = rows.filter((r: any) => r.send_status === 'failed').length;
  const totalAttachments = rows.reduce((sum: number, r: any) => sum + (r.attachments_count || 0), 0);

  return (
    <main style={{ maxWidth: 1280, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: '#111827' }}>Claims Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: 8 }}>
          Monitor sent claims, attachment counts, and delivery outcomes.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard label="Total Claims" value={totalClaims} />
        <StatCard label="Sent" value={sentCount} />
        <StatCard label="Failed" value={failedCount} />
        <StatCard label="Total Attachments" value={totalAttachments} />
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 18,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1120 }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={th}>Incident</th>
                <th style={th}>Recipient</th>
                <th style={th}>Subject</th>
                <th style={th}>Attachments</th>
                <th style={th}>Status</th>
                <th style={th}>Sent At</th>
                <th style={th}>Open</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => {
                const token = tokenMap.get(row.incident_id);
                return (
                  <tr key={row.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={tdMono}>{row.incident_id}</td>
                    <td style={td}>{row.recipient_email}</td>
                    <td style={td}>{row.subject}</td>
                    <td style={td}>{row.attachments_count}</td>
                    <td style={td}>
                      <StatusBadge status={row.send_status} />
                    </td>
                    <td style={td}>{row.sent_at || '-'}</td>
                    <td style={td}>
                      {token ? (
                        <Link
                          href={`/claim/${token}`}
                          style={{
                            display: 'inline-block',
                            textDecoration: 'none',
                            background: '#111827',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          Open Claim
                        </Link>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: 13 }}>No token</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

const th: CSSProperties = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: 13,
  color: '#374151',
  fontWeight: 700,
};

const td: CSSProperties = {
  padding: '14px 16px',
  fontSize: 14,
  color: '#111827',
  verticalAlign: 'top',
};

const tdMono: CSSProperties = {
  ...td,
  fontFamily: 'monospace',
  fontSize: 12,
};
