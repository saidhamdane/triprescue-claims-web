import Link from 'next/link';

export default function SiteNavbar() {
  const navLink = {
    color: '#374151',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
  } as const;

  return (
    <header
      style={{
        width: '100%',
        borderBottom: '1px solid #e5e7eb',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 20,
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
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            color: '#111827',
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          TripRescue AI
        </Link>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Link href="/pricing" style={navLink}>Pricing</Link>
          <Link href="/dashboard/claims" style={navLink}>Dashboard</Link>
          <Link href="/contact" style={navLink}>Contact</Link>
          <Link href="/privacy" style={navLink}>Privacy</Link>
          <Link href="/terms" style={navLink}>Terms</Link>
        </nav>
      </div>
    </header>
  );
}
