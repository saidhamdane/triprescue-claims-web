import Link from 'next/link';

const linkStyle: React.CSSProperties = {
  color: '#cbd5e1',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 600,
};

export default function SiteNavbar() {
  return (
    <header
      style={{
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(148,163,184,0.14)',
        background: 'rgba(2,6,23,0.82)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background: 'linear-gradient(135deg,#2563eb,#06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 15,
              boxShadow: '0 10px 30px rgba(37,99,235,0.35)',
            }}
          >
            T
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>TripRescue AI</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>Travel claims platform</div>
          </div>
        </Link>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Link href="/pricing" style={linkStyle}>Pricing</Link>
          <Link href="/dashboard/claims" style={linkStyle}>Dashboard</Link>
          <Link href="/contact" style={linkStyle}>Contact</Link>
          <Link href="/privacy" style={linkStyle}>Privacy</Link>
          <Link href="/terms" style={linkStyle}>Terms</Link>
          <Link
            href="/pricing"
            style={{
              textDecoration: 'none',
              color: '#fff',
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              boxShadow: '0 12px 30px rgba(37,99,235,0.25)',
            }}
          >
            Upgrade
          </Link>
        </nav>
      </div>
    </header>
  );
}
