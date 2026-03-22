import Link from 'next/link';

const link: React.CSSProperties = {
  color: '#94a3b8',
  textDecoration: 'none',
  fontSize: 13,
};

export default function SiteFooter() {
  return (
    <footer
      style={{
        marginTop: 72,
        borderTop: '1px solid rgba(148,163,184,0.14)',
        background: '#020617',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '28px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>TripRescue AI</div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
            Recover travel compensation faster with AI-assisted claim workflows.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/pricing" style={link}>Pricing</Link>
          <Link href="/contact" style={link}>Contact</Link>
          <Link href="/privacy" style={link}>Privacy</Link>
          <Link href="/terms" style={link}>Terms</Link>
        </div>
      </div>
    </footer>
  );
}
