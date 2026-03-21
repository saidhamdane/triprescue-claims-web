export default function PricingPage() {
  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 20 }}>
      <h1>Pricing</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
        <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 20 }}>
          <h2>Free</h2>
          <p>Generate claim letters</p>
        </div>
        <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 20 }}>
          <h2>Pro</h2>
          <p>Send claims with attachments + tracking</p>
        </div>
        <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 20 }}>
          <h2>Premium</h2>
          <p>Follow-ups, escalation, and multilingual claims</p>
        </div>
      </div>
    </main>
  );
}
