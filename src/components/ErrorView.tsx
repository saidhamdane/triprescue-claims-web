export default function ErrorView({ message }: { message: string }) {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f0f4f8' }}>
      <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(239,68,68,0.25)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 24px' }}>Claim Not Available</h1>
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'left' }}>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, margin: '0 0 20px', textAlign: 'center' }}>{message}</p>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Possible reasons:</p>
          {['The link may have expired', 'The link was deactivated', 'The token is incorrect'].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }}></span>{r}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
