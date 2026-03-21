import type { CSSProperties } from 'react';
export default function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid #e5e7eb',
        marginTop: 48,
        background: '#fff',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          color: '#6b7280',
          fontSize: 14,
        }}
      >
        <div>© {new Date().getFullYear()} TripRescue AI. All rights reserved.</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href="/pricing" style={{ color: '#6b7280', textDecoration: 'none' }}>Pricing</a>
          <a href="/privacy" style={{ color: '#6b7280', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ color: '#6b7280', textDecoration: 'none' }}>Terms</a>
          <a href="/contact" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
        </div>
      </div>
    </footer>
  );
}
