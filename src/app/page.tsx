import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage({ searchParams }: { searchParams: { token?: string } }) {
  if (searchParams?.token) { redirect(`/claim/${searchParams.token}`); }
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(37,99,235,0.25)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px' }}>TripRescue</h1>
        <p style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 32px' }}>Travel Claims Platform</p>
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: '0 0 20px' }}>Use the full link with a token to view a specific claim.</p>
          <div style={{ background: '#f1f5f9', borderRadius: '10px', padding: '12px 16px', border: '1px solid #e2e8f0' }}>
            <code style={{ fontSize: '12px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>claims.triprescue.site/?token=abc123</code>
          </div>
        </div>
      </div>
    </main>
  );
}
