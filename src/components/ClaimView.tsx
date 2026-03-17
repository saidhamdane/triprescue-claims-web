'use client';


import { jsPDF } from 'jspdf';
import { useMemo, useState } from 'react';
import { buildSuggestedSubject, humanEligibilityStatus } from '../lib/human-eligibility';

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

function dedupeDocuments(docs: any[]) {
  const seen = new Set();
  const out: any[] = [];

  for (const doc of docs || []) {
    const key = [
      doc?.id || '',
      doc?.file_url || '',
      doc?.name || doc?.file_name || ''
    ].join('|');

    if (seen.has(key)) continue;
    seen.add(key);
    out.push(doc);
  }

  return out;
}

function isProbablyArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text || '');
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
      status: 'possibly_eligible',
      framework: 'EU261',
      reason: 'This incident type may qualify for compensation under EU261 depending on route, carrier, delay length, and extraordinary circumstances.',
      confidence: 'Medium',
    };
  }

  if (['lost_baggage', 'damaged_baggage', 'delayed_baggage', 'lost_passport'].includes(type)) {
    return {
      status: hasExpenses ? 'possibly_eligible' : 'insufficient_info',
      framework: 'Montreal Convention',
      reason: 'This appears closer to a baggage-related compensation claim and may be pursued under baggage compensation rules and the Montreal Convention.',
      confidence: hasExpenses ? 'Medium' : 'Low',
    };
  }

  return {
    status: 'possibly_eligible',
    framework: 'General Claim',
    reason: 'This incident may support a direct complaint or reimbursement request, but the legal framework is not fully clear from the available data.',
    confidence: 'Low',
  };
}

function downloadLetterAsTxt(letter: string, incident: any) {
  const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeId = String(incident?.id || 'claim').replace(/[^a-zA-Z0-9-_]/g, '_');
  a.href = url;
  a.download = `claim-letter-${safeId}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
    
function getPassengerName(incident: any) {
  return (
    incident?.passenger_name ||
    incident?.full_name ||
    incident?.user_name ||
    incident?.name ||
    incident?.traveler_name ||
    ''
  );
}

function getPassengerEmail(incident: any) {
  return (
    incident?.passenger_email ||
    incident?.email ||
    incident?.user_email ||
    incident?.traveler_email ||
    ''
  );
}

function getFormattedDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeGeneratedLetter(letter: string, incident: any) {
  if (!letter) return letter;

  const passengerName = getPassengerName(incident) || 'Passenger';
  const passengerEmail = getPassengerEmail(incident) || 'passenger@email.com';
  const formattedDate = getFormattedDate();

  let out = letter;

  out = out.replace(/\[Passenger Name\]/g, passengerName);
  out = out.replace(/\[Passenger Email\]/g, passengerEmail);
  out = out.replace(/\[Date\]/g, formattedDate);

  return out;
}

function buildBetterSubject(incident: any) {
  const incidentType =
    incident?.title ||
    incident?.type ||
    'Travel Claim';

  const flight = incident?.flight_number || 'No-Flight';
  const airline = incident?.airline || '';

  const cleanType = String(incidentType)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m: string) => m.toUpperCase());

  return `Subject: ${cleanType} - Flight ${flight}${airline ? ' - ' + airline : ''}`;
}

function ensureSubjectLine(letter: string, incident: any) {
  if (!letter) return letter;
  const betterSubject = buildBetterSubject(incident);

  if (/^Subject:/m.test(letter)) {
    return letter.replace(/^Subject:.*$/m, betterSubject);
  }

  return `${betterSubject}\n\n${letter}`;
}

function downloadLetterAsPdf(letter: string, incident: any) {
  if (!letter) return;

  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;

  const title = incident?.title || incident?.type || 'Claim Letter';
  const fileBase = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'claim-letter';

  doc.setFillColor(10, 18, 40);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TripRescue Claim Letter', margin, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(180, 190, 210);
  doc.text(`Incident: ${title}`, margin, 56);

  doc.setTextColor(235, 240, 255);
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(letter, maxWidth);

  let y = 84;
  const lineHeight = 16;

  for (const line of lines) {
    if (y > pageHeight - 50) {
      doc.addPage();
      doc.setFillColor(10, 18, 40);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setTextColor(235, 240, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      y = 40;
    }

    doc.text(String(line), margin, y);
    y += lineHeight;
  }

  doc.save(`${fileBase}-claim-letter.pdf`);
}

export default function ClaimView({ data }: ClaimViewProps) {
  const { incident, expenses, documents } = data;
  const safeDocuments = dedupeDocuments(documents || []);
  const autoPassengerName = getPassengerName(incident);
  const autoPassengerEmail = getPassengerEmail(incident);
  const imageDocs = safeDocuments.filter(isProbablyImage);
  const otherDocs = safeDocuments.filter((doc) => !isProbablyImage(doc));
  const amount = incident?.claim_amount ?? incident?.estimated_value_loss ?? incident?.amount ?? 0;

  const eligibility = useMemo(() => localEligibility(incident, expenses), [incident, expenses]);

  const [openLetterModal, setOpenLetterModal] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar' | 'es'>('en');
  const [letterTone, setLetterTone] = useState<'short' | 'standard' | 'legal'>('standard');
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const [serverEligibility, setServerEligibility] = useState<any>(null);
  const [letterError, setLetterError] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendResult, setSendResult] = useState('');
  const [copyEmailTo, setCopyEmailTo] = useState('');
  const [sendingCopy, setSendingCopy] = useState(false);
  const [copySendResult, setCopySendResult] = useState('');
  const [flightStatus, setFlightStatus] = useState<any>(null);
  const [loadingFlightStatus, setLoadingFlightStatus] = useState(false);

  async function lookupFlight() {
    try {
      setLoadingFlightStatus(true);
      const rawFlight = String(incident?.flight_number || '').trim();
      const match = rawFlight.match(/^([A-Za-z]{2,3})(\d+)/);
      if (!match) {
        throw new Error('Flight number format not recognized. Use format like TP1234');
      }

      const carrierCode = match[1].toUpperCase();
      const flightNumber = match[2];
      const dateValue = incident?.created_at ? new Date(incident.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

      const res = await fetch('/api/flight-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrierCode, flightNumber, scheduledDepartureDate: dateValue }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || 'Flight lookup failed');

      setFlightStatus(payload?.data || null);
    } catch (err: any) {
      setLetterError(err?.message || 'Flight lookup failed');
    } finally {
      setLoadingFlightStatus(false);
    }
  }

  async function generateLetter() {
    try {
      setLoadingLetter(true);
      setGeneratedLetter('');
      setLetterError('');
      setSendResult('');

      const res = await fetch('/api/generate-claim-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, incident, expenses, documents, flightStatus }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || 'Failed to generate letter');

      const rawLetter = payload?.letter || '';
      const subject = buildSuggestedSubject(incident);
      const finalLetter = rawLetter.startsWith('Subject:') ? rawLetter : `${subject}\n\n${rawLetter}`;

      setGeneratedLetter(finalLetter);
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
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function sendLetter() {
    try {
      setSendingEmail(true);
      setSendResult('');

      if (!emailTo) {
        throw new Error('Enter recipient email first');
      }

      if (!generatedLetter) {
        throw new Error('Generate letter first');
      }

      const subjectLine =
        generatedLetter
          .split('\n')
          .find((line) => line.startsWith('Subject:'))
          ?.replace(/^Subject:\s*/, '') ||
        buildSuggestedSubject(incident).replace(/^Subject:\s*/, '');

      const res = await fetch('/api/send-claim-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          subject: subjectLine,
          letter: generatedLetter,
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to send email');
      }

      setSendResult('Letter sent successfully');
    } catch (err) {
      setSendResult(err?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  }

  async function sendCopyLetter() {
    try {
      setSendingCopy(true);
      setCopySendResult('');

      if (!copyEmailTo) {
        throw new Error('Enter your email first');
      }

      if (!generatedLetter) {
        throw new Error('Generate letter first');
      }

      const subjectLine =
        generatedLetter
          .split('\n')
          .find((line) => line.startsWith('Subject:'))
          ?.replace(/^Subject:\s*/, '') ||
        buildSuggestedSubject(incident).replace(/^Subject:\s*/, '');

      const res = await fetch('/api/send-claim-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: copyEmailTo,
          subject: '[Copy] ' + subjectLine,
          letter: generatedLetter,
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to send copy');
      }

      setCopySendResult('Copy sent successfully');
    } catch (err) {
      setCopySendResult(err?.message || 'Failed to send copy');
    } finally {
      setSendingCopy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#020817', color: '#fff', padding: '24px 16px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 24, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
          <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: 999, background: '#172554', color: '#93c5fd', fontSize: 12, marginBottom: 16 }}>
            Shared Claim
          </div>

          <h1 style={{ fontSize: 42, margin: '0 0 8px', fontWeight: 700 }}>Claim Summary</h1>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>ID: {incident?.id ?? 'N/A'}</p>

          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            <div style={card}>
              <div style={label}>Incident Type</div>
              <div style={value}>{formatIncidentType(incident?.type ?? incident?.incident_type)}</div>
            </div>

            <div style={card}>
              <div style={label}>Description</div>
              <div style={{ ...value, lineHeight: 1.6 }}>{incident?.description ?? incident?.title ?? 'No description'}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
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

          <div style={{ background: '#172554', border: '1px solid #1d4ed8', borderRadius: 20, padding: 20, marginBottom: 24 }}>
            <div style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 8 }}>Claim Amount</div>
            <div style={{ color: '#60a5fa', fontSize: 44, fontWeight: 700 }}>${Number(amount).toFixed(2)}</div>
          </div>

          <div style={{ background: '#1e1b4b', border: '1px solid #3730a3', borderRadius: 20, padding: 20, marginBottom: 24 }}>
            <div style={{ color: '#a5b4fc', fontSize: 14, marginBottom: 8 }}>Compensation Check</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{humanEligibilityStatus(eligibility.status)}</div>
            <div style={{ color: '#cbd5e1', marginBottom: 6 }}><strong>Framework:</strong> {eligibility.framework}</div>
            <div style={{ color: '#cbd5e1', marginBottom: 6 }}><strong>Confidence:</strong> {eligibility.confidence}</div>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{eligibility.reason}</p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <button onClick={() => setOpenLetterModal(true)} style={primaryBtn}>✨ Generate AI Claim Letter</button>
              <button onClick={lookupFlight} style={secondaryBtn}>
                {loadingFlightStatus ? 'Checking flight...' : 'Check Flight Status'}
              </button>
            </div>
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
                    <div style={{ ...value, color: '#60a5fa' }}>${Number(expense.amount ?? 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 style={sectionTitle}>Documents</h2>

            {imageDocs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 10 }}>Images</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {imageDocs.map((doc) => (
                    <div key={doc.id} style={{ background: '#0b1220', border: '1px solid #1e293b', borderRadius: 18, overflow: 'hidden' }}>
                      <a href={doc.file_url} target="_blank" rel="noreferrer">
                        <img src={doc.file_url} alt={doc.name ?? 'Incident image'} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block', background: '#111827' }} />
                      </a>
                      <div style={{ padding: 10, fontSize: 12, color: '#94a3b8', wordBreak: 'break-all' }}>
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
                    <div style={{ ...value, marginBottom: 10 }}>{doc.name ?? 'Document'}</div>
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#172554', color: '#93c5fd', border: '1px solid #1d4ed8', borderRadius: 12, padding: '10px 14px', textDecoration: 'none', fontWeight: 600 }}>
                        Open file
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {safeDocuments.length === 0 && <div style={emptyBox}>No documents attached.</div>}
          </section>
        </div>
      </div>

      {openLetterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
          <div style={{ width: '100%', maxWidth: 900, background: '#0f172a', border: '1px solid #334155', borderRadius: 24, padding: 24, maxHeight: '92vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 28, margin: 0 }}>Generate AI Claim Letter</h3>
              <button onClick={() => setOpenLetterModal(false)} style={secondaryBtn}>Close</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Select language</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => setLanguage('en')} style={langBtn(language === 'en')}>🇬🇧 English</button>
                <button onClick={() => setLanguage('ar')} style={langBtn(language === 'ar')}>🇸🇦 العربية</button>
                <button onClick={() => setLanguage('es')} style={langBtn(language === 'es')}>🇪🇸 Español</button>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Select tone</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => setLetterTone('short')} style={langBtn(letterTone === 'short')}>
                    Short
                  </button>
                  <button onClick={() => setLetterTone('standard')} style={langBtn(letterTone === 'standard')}>
                    Standard
                  </button>
                  <button onClick={() => setLetterTone('legal')} style={langBtn(letterTone === 'legal')}>
                    Legal
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <button onClick={generateLetter} disabled={loadingLetter} style={primaryBtn}>
                {loadingLetter ? 'Generating...' : 'Generate'}
              </button>
            </div>

            {letterError && (
              <div style={{ ...card, border: '1px solid #7f1d1d', background: '#450a0a', color: '#fecaca', marginTop: 16 }}>
                {letterError}
              </div>
            )}

            {serverEligibility && (
              <div style={{ ...card, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Eligibility result</div>
                <div style={{ color: '#cbd5e1', marginBottom: 4 }}>Status: {humanEligibilityStatus(serverEligibility.status)}</div>
                <div style={{ color: '#cbd5e1', marginBottom: 4 }}>Framework: {serverEligibility.framework}</div>
                <div style={{ color: '#cbd5e1', marginBottom: 4 }}>Confidence: {serverEligibility.confidence}</div>
                <div style={{ color: '#94a3b8', marginTop: 8 }}>{serverEligibility.reason}</div>
                {serverEligibility.missingInfo?.length > 0 && (
                  <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: '#3f1d0b', border: '1px solid #9a3412', color: '#fed7aa' }}>
                    <strong>Missing information detected:</strong> {serverEligibility.missingInfo.join(', ')}
                  </div>
                )}
              </div>
            )}

            {flightStatus && (
              <div style={{ ...card, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Flight verification</div>
                <pre style={{ whiteSpace: 'pre-wrap', color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
                  {JSON.stringify(flightStatus, null, 2)}
                </pre>
              </div>
            )}

            {generatedLetter && (
              <div style={{ marginTop: 16 }}>
                <textarea
                  value={generatedLetter}
                  readOnly
                  style={{
                    width: '100%',
                    minHeight: 420,
                    background: '#020617',
                    color: '#e2e8f0',
                    border: '1px solid #334155',
                    borderRadius: 16,
                    padding: 16,
                    fontSize: 16,
                    lineHeight: 1.75,
                    whiteSpace: 'pre-wrap',
                  }}
                />
                <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={copyLetter} style={secondaryBtn}>{copied ? 'Copied' : 'Copy'}</button>
                    <button onClick={() => downloadLetterAsTxt(generatedLetter, incident)} style={secondaryBtn}>
                    Download TXT
                  </button>
                  <button
                    onClick={() => downloadLetterAsPdf(generatedLetter, incident)}
                    style={secondaryBtn}
                  >
                    Download PDF
                  </button>
                    <button onClick={generateLetter} style={secondaryBtn}>Regenerate</button>
                  </div>

                  <div style={{ ...card }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Send directly</div>
                    <input
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="airline@example.com"
                      style={{
                        width: '100%',
                        background: '#020617',
                        color: '#fff',
                        border: '1px solid #334155',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                      }}
                    />
                    <button onClick={sendLetter} disabled={sendingEmail} style={primaryBtn}>
                      {sendingEmail ? 'Sending...' : 'Send Email'}
                    </button>
                    {sendResult && (
                    <div style={{ marginTop: 10, color: '#cbd5e1' }}>{sendResult}</div>
                  )}
                </div>

                <div style={{ ...card, marginTop: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Send copy to me</div>
                  <input
                    value={copyEmailTo}
                    onChange={(e) => setCopyEmailTo(e.target.value)}
                    placeholder={autoPassengerEmail || "your@email.com"}
                    style={{
                      width: '100%',
                      background: '#020617',
                      color: '#fff',
                      border: '1px solid #334155',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 10,
                    }}
                  />
                  <button onClick={sendCopyLetter} disabled={sendingCopy} style={primaryBtn}>
                    {sendingCopy ? 'Sending copy...' : 'Send Copy'}
                  </button>
                  {copySendResult && (
                    <div style={{ marginTop: 10, color: '#cbd5e1' }}>{copySendResult}</div>
                  )}
                </div>
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
