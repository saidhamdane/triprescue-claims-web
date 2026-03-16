'use client';

import { useMemo, useState } from 'react';

type ClaimViewProps = {
  data: {
    incident: any;
    expenses: any[];
    documents: any[];
    shareLink?: any;
  };
};

function formatIncidentType(value?: string) {
  if (!value) return 'Unknown';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isProbablyImage(doc: any) {
  const url = String(doc?.file_url ?? '').toLowerCase();
  const name = String(doc?.name ?? doc?.file_name ?? '').toLowerCase();
  return (
    url.includes('/storage/v1/object/public/') ||
    url.includes('baggage-photo') ||
    url.endsWith('.jpg') ||
    url.endsWith('.jpeg') ||
    url.endsWith('.png') ||
    url.endsWith('.webp') ||
    name.includes('baggage-photo') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp')
  );
}

function localEligibility(incident: any, expenses: any[]) {
  const type = String(incident?.type || '').toLowerCase();
  const hasExpenses = Array.isArray(expenses) && expenses.length > 0;

  if (['cancelled_flight', 'flight_delay', 'denied_boarding'].includes(type)) {
    return {
      status: 'Possibly eligible',
      framework: 'EU261',
      reason:
        'This incident type may qualify for compensation under EU261 depending on route, carrier, delay length, and extraordinary circumstances.',
      confidence: 'Medium',
    };
  }

  if (['lost_baggage', 'damaged_baggage', 'delayed_baggage', 'lost_passport'].includes(type)) {
    return {
      status: hasExpenses ? 'Possibly eligible' : 'Needs more details',
      framework: 'Montreal Convention',
      reason:
        'This appears closer to a baggage-related compensation claim and may be pursued under baggage compensation rules and the Montreal Convention.',
      confidence: hasExpenses ? 'Medium' : 'Low',
    };
  }

  return {
    status: 'Possibly eligible',
    framework: 'General Claim',
    reason:
      'This incident may support a direct complaint or reimbursement request, but the legal framework is not fully clear from the available data.',
    confidence: 'Low',
  };
}

export default function ClaimView({ data }: ClaimViewProps) {
  const { incident, expenses, documents } = data;
  const imageDocs = documents.filter(isProbablyImage);
  const otherDocs = documents.filter((doc) => !isProbablyImage(doc));
  const amount =
    incident?.claim_amount ??
    incident?.estimated_value_loss ??
    incident?.amount ??
    0;

  const eligibility = useMemo(
    () => localEligibility(incident, expenses),
    [incident, expenses]
  );

  const [openLetterModal, setOpenLetterModal] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar' | 'es'>('en');
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [serverEligibility, setServerEligibility] = useState<any>(null);
  const [letterError, setLetterError] = useState('');

  async function generateLetter() {
    try {
      setLoadingLetter(true);
      setGeneratedLetter('');
      setLetterError('');

      const res = await fetch('/api/generate-claim-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, incident, expenses, documents }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || 'Failed to generate letter');

      setGeneratedLetter(payload?.letter || '');
      setServerEligibility(payload?.eligibility || null);
    } catch (err: any) {
      setLetterError(err?.message || 'Failed to generate letter');
    } finally {
      setLoadingLetter(false);
    }
  }

  async function copyLetter() {
    if (!generatedLetter) return;
    await navigator.clipboard.writeText(generatedLetter);
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#020817',
        color: '#fff',
        padding: '24px 16px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: 999,
              background: '#172554',
              color: '#93c5fd',
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            Shared Claim
          </div>

          <h1 style={{ fontSize: 42, margin: '0 0 8px', fontWeight: 700 }}>
            Claim Summary
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>
            ID: {incident?.id ?? 'N/A'}
          </p>

          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            <div style={card}>
              <div style={label}>Incident Type</div>
              <div style={value}>
                {formatIncidentType(incident?.type ?? incident?.incident_type)}
              </div>
            </div>

            <div style={card}>
              <div style={label}>Description</div>
              <div style={{ ...value, lineHeight: 1.6 }}>
                {incident?.description ?? incident?.title ?? 'No description'}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
              }}
            >
              <div style={card}>
                <div style={label}>Airline</div>
                <div style={value}>{incident?.airline ?? 'N/A'}</div>
              </div>

              <div style={card}>
                <div style={label}>Flight Number</div>
                <div style={value}>{incident?.flight_number ?? 'N/A'}</div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#172554',
              border: '1px solid #1d4ed8',
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 8 }}>
              Claim Amount
            </div>
            <div style={{ color: '#60a5fa', fontSize: 44, fontWeight: 700 }}>
              ${Number(amount).toFixed(2)}
            </div>
          </div>

          <div
            style={{
              background: '#1e1b4b',
              border: '1px solid #3730a3',
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div style={{ color: '#a5b4fc', fontSize: 14, marginBottom: 8 }}>
              Compensation Check
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              {eligibility.status}
            </div>
            <div style={{ color: '#cbd5e1', marginBottom: 6 }}>
              <strong>Framework:</strong> {eligibility.framework}
            </div>
            <div style={{ color: '#cbd5e1', marginBottom: 6 }}>
              <strong>Confidence:</strong> {eligibility.confidence}
            </div>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{eligibility.reason}</p>

            <button
              onClick={() => setOpenLetterModal(true)}
              style={{
                marginTop: 16,
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                padding: '12px 18px',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✨ Generate AI Claim Letter
            </button>
          </div>

          <section style={{ marginBottom: 24 }}>
            <h2 style={sectionTitle}>Expenses</h2>
            {expenses.length === 0 ? (
              <div style={emptyBox}>No expenses attached.</div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {expenses.map((expense) => (
                  <div key={expense.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={value}>{expense.description ?? 'Expense'}</div>
                    <div style={{ ...value, color: '#60a5fa' }}>
                      ${Number(expense.amount ?? 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 style={sectionTitle}>Documents</h2>

            {imageDocs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 10 }}>
                  Images
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: 16,
                  }}
                >
                  {imageDocs.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        background: '#0b1220',
                        border: '1px solid #1e293b',
                        borderRadius: 18,
                        overflow: 'hidden',
                      }}
                    >
                      <a href={doc.file_url} target="_blank" rel="noreferrer">
                        <img
                          src={doc.file_url}
                          alt={doc.name ?? 'Incident image'}
                          style={{
                            width: '100%',
                            height: 220,
                            objectFit: 'cover',
                            display: 'block',
                            background: '#111827',
                          }}
                        />
                      </a>
                      <div
                        style={{
                          padding: 10,
                          fontSize: 12,
                          color: '#94a3b8',
                          wordBreak: 'break-all',
                        }}
                      >
                        {doc.name ?? 'Image'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {otherDocs.length > 0 && (
              <div style={{ display: 'grid', gap: 12 }}>
                {otherDocs.map((doc) => (
                  <div key={doc.id} style={card}>
                    <div style={{ ...value, marginBottom: 10 }}>
                      {doc.name ?? 'Document'}
                    </div>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-block',
                          background: '#172554',
                          color: '#93c5fd',
                          border: '1px solid #1d4ed8',
                          borderRadius: 12,
                          padding: '10px 14px',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Open file
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {documents.length === 0 && <div style={emptyBox}>No documents attached.</div>}
          </section>
        </div>
      </div>

      {openLetterModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 860,
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 24,
              padding: 24,
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 28, margin: 0 }}>Generate AI Claim Letter</h3>
              <button
                onClick={() => setOpenLetterModal(false)}
                style={secondaryBtn}
              >
                Close
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
                Select language
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => setLanguage('en')} style={langBtn(language === 'en')}>🇬🇧 English</button>
                <button onClick={() => setLanguage('ar')} style={langBtn(language === 'ar')}>🇸🇦 العربية</button>
                <button onClick={() => setLanguage('es')} style={langBtn(language === 'es')}>🇪🇸 Español</button>
              </div>
            </div>

            <button onClick={generateLetter} disabled={loadingLetter} style={primaryBtn}>
              {loadingLetter ? 'Generating...' : 'Generate'}
            </button>

            {letterError && (
              <div style={{ ...card, border: '1px solid #7f1d1d', background: '#450a0a', color: '#fecaca', marginTop: 16 }}>
                {letterError}
              </div>
            )}

            {serverEligibility && (
              <div style={{ ...card, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Eligibility result</div>
                <div style={{ color: '#cbd5e1', marginBottom: 4 }}>Status: {serverEligibility.status}</div>
                <div style={{ color: '#cbd5e1', marginBottom: 4 }}>Framework: {serverEligibility.framework}</div>
                <div style={{ color: '#cbd5e1', marginBottom: 4 }}>Confidence: {serverEligibility.confidence}</div>
                <div style={{ color: '#94a3b8', marginTop: 8 }}>{serverEligibility.reason}</div>
                {serverEligibility.missingInfo?.length > 0 && (
                  <div style={{ color: '#94a3b8', marginTop: 8 }}>
                    Missing info: {serverEligibility.missingInfo.join(', ')}
                  </div>
                )}
              </div>
            )}

            {generatedLetter && (
              <div style={{ marginTop: 16 }}>
                <textarea
                  value={generatedLetter}
                  readOnly
                  style={{
                    width: '100%',
                    minHeight: 320,
                    background: '#020617',
                    color: '#e2e8f0',
                    border: '1px solid #334155',
                    borderRadius: 16,
                    padding: 16,
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <button onClick={copyLetter} style={secondaryBtn}>Copy</button>
                  <button onClick={generateLetter} style={secondaryBtn}>Regenerate</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

const card: React.CSSProperties = {
  background: 'rgba(30,41,59,0.75)',
  border: '1px solid #1e293b',
  borderRadius: 18,
  padding: 16,
};

const label: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: 14,
  marginBottom: 6,
};

const value: React.CSSProperties = {
  color: '#fff',
  fontSize: 18,
  fontWeight: 600,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 14,
};

const emptyBox: React.CSSProperties = {
  background: 'rgba(30,41,59,0.45)',
  border: '1px solid #1e293b',
  borderRadius: 18,
  padding: 16,
  color: '#94a3b8',
};

const primaryBtn: React.CSSProperties = {
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 14,
  padding: '12px 18px',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryBtn: React.CSSProperties = {
  background: '#111827',
  color: '#e2e8f0',
  border: '1px solid #334155',
  borderRadius: 12,
  padding: '10px 14px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

function langBtn(active: boolean): React.CSSProperties {
  return {
    background: active ? '#2563eb' : '#111827',
    color: '#fff',
    border: active ? '1px solid #3b82f6' : '1px solid #334155',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  };
}
