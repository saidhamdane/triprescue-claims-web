import Link from 'next/link';

export default function SiteFooter() {
  const link = {
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: 13,
  } as const;

  return (
    <footer
      style={{
        borderTop: '1px solid #e5e7eb',
        background: '#ffffff',
        marginTop: 48,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '18px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ color: '#6b7280', fontSize: 13 }}>
          © 2026 TripRescue AI. All rights reserved.
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/pricing" style={link}>Pricing</Link>
          <Link href="/privacy" style={link}>Privacy</Link>
          <Link href="/terms" style={link}>Terms</Link>
          <Link href="/contact" style={link}>Contact</Link>
        </div>
      </div>
    </footer>
  );
}
