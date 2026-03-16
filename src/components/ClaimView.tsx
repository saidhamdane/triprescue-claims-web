import { ClaimData } from '../lib/get-public-claim';
import ClaimLetterGenerator from './ClaimLetterGenerator';

const typeConfig: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  lost_baggage: { icon: '🧳', label: 'Lost Baggage', color: '#c2410c', bg: '#fff7ed' },
  delayed_flight: { icon: '⏱️', label: 'Delayed Flight', color: '#1d4ed8', bg: '#eff6ff' },
  cancelled_flight: { icon: '❌', label: 'Cancelled Flight', color: '#dc2626', bg: '#fef2f2' },
  hotel_problem: { icon: '🏨', label: 'Hotel Problem', color: '#7c3aed', bg: '#f5f3ff' },
};

const statusColors: Record<string, { dot: string; text: string; bg: string }> = {
  open: { dot: '#10b981', text: '#065f46', bg: '#ecfdf5' },
  in_progress: { dot: '#f59e0b', text: '#92400e', bg: '#fffbeb' },
  resolved: { dot: '#3b82f6', text: '#1e40af', bg: '#eff6ff' },
  closed: { dot: '#94a3b8', text: '#475569', bg: '#f1f5f9' },
};

function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function fmtMoney(a: number, c: string) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: c || 'USD' }).format(a); }

export default function ClaimView({ data }: { data: ClaimData }) {
  const { incident, expenses, documents, shareText, expiresAt } = data;
  const t = typeConfig[incident.type] || typeConfig.lost_baggage;
  const s = statusColors[incident.status] || statusColors.open;
  const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);

  const card: React.CSSProperties = { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)' };
  const sec: React.CSSProperties = { padding: '20px 24px', borderBottom: '1px solid #f1f5f9' };
  const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #f1f5f9', marginBottom: '6px' };

  return (
    <main style={{ minHeight: '100vh', padding: '24px 16px', background: 'linear-gradient(180deg, #eef2f7, #f0f4f8)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '40px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', fontSize: '13px', fontWeight: 600 }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            TripRescue
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>Shared Claim Report</p>
        </header>

        <div style={card}>
          {/* Type Banner */}
          <div style={{ padding: '16px 24px', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>{t.icon}</span>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: t.color }}>{t.label}</span>
                {incident.reference_number && <p style={{ fontSize: '11px', color: t.color, opacity: 0.6, margin: '2px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>Ref: {incident.reference_number}</p>}
              </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: s.bg, fontSize: '12px', fontWeight: 600, color: s.text }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot }}></span>
              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1).replace(/_/g, ' ')}
            </div>
          </div>

          {/* Title */}
          <div style={sec}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}>{incident.title}</h1>
            {incident.description && <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>{incident.description}</p>}
          </div>

          {/* Details */}
          <div style={sec}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {incident.airline && <div><p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', margin: '0 0 4px' }}>Airline</p><p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{incident.airline}</p></div>}
              {incident.flight_number && <div><p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', margin: '0 0 4px' }}>Flight</p><p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{incident.flight_number}</p></div>}
              <div><p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', margin: '0 0 4px' }}>Filed</p><p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{fmtDate(incident.created_at)}</p></div>
              <div><p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', margin: '0 0 4px' }}>Claim Amount</p><p style={{ fontSize: '16px', fontWeight: 700, color: '#059669', margin: 0 }}>{fmtMoney(incident.claim_amount, incident.currency)}</p></div>
            </div>
          </div>

          {/* Expenses */}
          {expenses.length > 0 && (
            <div style={sec}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#475569', margin: 0 }}>💳 Expenses ({expenses.length})</h2>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '12px' }}>Total: {fmtMoney(totalExp, incident.currency)}</span>
              </div>
              {expenses.map((exp, i) => (
                <div key={exp.id || i} style={row}>
                  <span style={{ fontSize: '13px', color: '#475569' }}>{exp.description}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#1e293b' }}>{fmtMoney(exp.amount, exp.currency)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div style={sec}>
              <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#475569', margin: '0 0 12px' }}>📎 Documents ({documents.length})</h2>
              {documents.map((doc, i) => {
                const isImg = doc.file_url && /\.(jpg|jpeg|png|gif|webp)/i.test(doc.file_url);
                const hasUrl = doc.file_url && doc.file_url.length > 0;
                return (
                  <a key={doc.id || i} href={hasUrl ? doc.file_url : '#'} target={hasUrl ? '_blank' : undefined} rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #f1f5f9', marginBottom: '6px', textDecoration: 'none', color: 'inherit' }}>
                    {isImg ? <img src={doc.file_url} alt={doc.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>📄</div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0', textTransform: 'uppercase' }}>{doc.type}</p>
                    </div>
                    {hasUrl && <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, flexShrink: 0 }}>View →</span>}
                  </a>
                );
              })}
            </div>
          )}

          {documents.length === 0 && (
            <div style={sec}>
              <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#475569', margin: '0 0 8px' }}>📎 Documents</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No documents attached to this claim.</p>
            </div>
          )}

          {/* Note */}
          {shareText && (
            <div style={sec}>
              <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#475569', margin: '0 0 12px' }}>💬 Note from Claimant</h2>
              <div style={{ padding: '16px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fef3c7' }}>
                <p style={{ fontSize: '14px', color: '#78350f', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>&ldquo;{shareText}&rdquo;</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: '14px 24px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
            <span>Shared via TripRescue</span>
            {expiresAt && <span>Expires: {fmtDate(expiresAt)}</span>}
          </div>
        </div>

        <footer style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#94a3b8' }}>
          <p style={{ margin: 0 }}>This report is for informational purposes only. © {new Date().getFullYear()} TripRescue</p>
        </footer>
      </div>
    </main>
  );
}
