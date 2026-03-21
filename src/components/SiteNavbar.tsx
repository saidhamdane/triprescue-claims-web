import type { CSSProperties } from 'react';
export default function SiteNavbar() {
  const linkStyle: CSSProperties = {
    textDecoration: 'none',
    color: '#374151',
    fontWeight: 600,
    fontSize: 14,
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <a href="/" style={{ textDecoration: 'none', color: '#111827', fontWeight: 800, fontSize: 20 }}>
          TripRescue AI
        </a>

        <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href="/pricing" style={linkStyle}>Pricing</a>
          <a href="/dashboard/claims" style={linkStyle}>Dashboard</a>
          <a href="/contact" style={linkStyle}>Contact</a>
          <a href="/privacy" style={linkStyle}>Privacy</a>
          <a href="/terms" style={linkStyle}>Terms</a>
        </nav>
      </div>
    </header>
  );
}
