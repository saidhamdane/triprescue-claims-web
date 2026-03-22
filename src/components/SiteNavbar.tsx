import Link from 'next/link';
import type { CSSProperties } from 'react';

const navLink: CSSProperties = {
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
        borderBottom: '1px solid rgba(148,163,184,0.12)',
        background: 'rgba(2,6,23,0.86)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 13,
              background: 'linear-gradient(135deg,#2563eb,#06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 16,
              boxShadow: '0 10px 30px rgba(37,99,235,0.35)',
              flexShrink: 0,
            }}
          >
            T
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>TripRescue AI</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>Premium travel claims platform</div>
          </div>
        </Link>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <Link href="/pricing" style={navLink}>Pricing</Link>
          <Link href="/dashboard/claims" style={navLink}>Dashboard</Link>
          <Link href="/contact" style={navLink}>Contact</Link>
          <Link href="/privacy" style={navLink}>Privacy</Link>
          <Link href="/terms" style={navLink}>Terms</Link>
          <Link
            href="/upgrade"
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
