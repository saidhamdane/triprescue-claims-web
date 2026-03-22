'use client';

import { useState } from 'react';

export default function BillingDebugPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    try {
      setLoading(true);
      setResult(null);

      const res = await fetch(`/api/billing/status?email=${encodeURIComponent(email)}`);
      const payload = await res.json().catch(() => ({}));
      setResult(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 860, margin: '40px auto', padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Billing Access Debug</h1>
      <p>Check the active plan for any email stored in billing_subscriptions.</p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer email"
          style={{
            minWidth: 280,
            padding: '12px 14px',
            border: '1px solid #d1d5db',
            borderRadius: 12,
          }}
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          style={{
            background: '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 16px',
            fontWeight: 700,
          }}
        >
          {loading ? 'Checking...' : 'Check Access'}
        </button>
      </div>

      <pre
        style={{
          background: '#0f172a',
          color: '#e5e7eb',
          padding: 16,
          borderRadius: 16,
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
        }}
      >
        {JSON.stringify(result, null, 2)}
      </pre>
    </main>
  );
}
