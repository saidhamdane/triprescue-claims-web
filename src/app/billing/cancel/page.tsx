import type { CSSProperties } from 'react';
export default function BillingCancelPage() {
  return (
    <main style={{ maxWidth: 860, margin: '60px auto', padding: 16 }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 20,
        padding: 28,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ marginTop: 0 }}>Checkout canceled</h1>
        <p>No payment was completed. You can return and choose a plan again.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
          <a href="/pricing" style={btnPrimary}>Return to Pricing</a>
          <a href="/" style={btnSecondary}>Go Home</a>
        </div>
      </div>
    </main>
  );
}

const btnPrimary: CSSProperties = {
  textDecoration: 'none',
  background: '#111827',
  color: '#fff',
  padding: '12px 18px',
  borderRadius: 12,
  fontWeight: 700,
};

const btnSecondary: CSSProperties = {
  textDecoration: 'none',
  background: '#fff',
  color: '#111827',
  padding: '12px 18px',
  borderRadius: 12,
  fontWeight: 700,
  border: '1px solid #d1d5db',
};
