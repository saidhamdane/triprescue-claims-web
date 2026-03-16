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
        body: JSON.stringify({
          language,
          incident,
          expenses,
          documents,
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to generate letter');
      }

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
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="inline-flex items-center rounded-full border border-blue-800 bg-blue-950/50 px-3 py-1 text-xs font-medium text-blue-300 mb-4">
            Shared Claim
          </div>

          <h1 className="text-4xl font-bold mb-2">Claim Summary</h1>
          <p className="text-slate-400 mb-8">ID: {incident?.id ?? 'N/A'}</p>

          <div className="space-y-4 mb-8">
            <div className="rounded-2xl bg-slate-800/60 p-4">
              <div className="text-slate-400 text-sm mb-1">Incident Type</div>
              <div className="text-lg font-semibold">
                {formatIncidentType(incident?.type ?? incident?.incident_type)}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/60 p-4">
              <div className="text-slate-400 text-sm mb-1">Description</div>
              <div className="text-base">
                {incident?.description ?? incident?.title ?? 'No description'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-800/60 p-4">
                <div className="text-slate-400 text-sm mb-1">Airline</div>
                <div>{incident?.airline ?? 'N/A'}</div>
              </div>

              <div className="rounded-2xl bg-slate-800/60 p-4">
                <div className="text-slate-400 text-sm mb-1">Flight Number</div>
                <div>{incident?.flight_number ?? 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-950/60 border border-blue-900/50 p-5 mb-6">
            <div className="text-slate-300 text-sm mb-2">Claim Amount</div>
            <div className="text-4xl font-bold text-blue-400">
              ${Number(amount).toFixed(2)}
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-800 bg-indigo-950/40 p-5 mb-6">
            <div className="text-sm text-indigo-300 mb-2">Compensation Check</div>
            <div className="text-xl font-semibold mb-2">{eligibility.status}</div>
            <div className="text-slate-300 mb-1">
              <span className="font-medium">Framework:</span> {eligibility.framework}
            </div>
            <div className="text-slate-300 mb-1">
              <span className="font-medium">Confidence:</span> {eligibility.confidence}
            </div>
            <p className="text-slate-400 mt-2">{eligibility.reason}</p>

            <button
              onClick={() => setOpenLetterModal(true)}
              className="mt-4 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 py-3 font-semibold text-white"
            >
              ✨ Generate AI Claim Letter
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Expenses</h2>
            {expenses.length === 0 ? (
              <div className="rounded-2xl bg-slate-800/40 p-4 text-slate-400">
                No expenses attached.
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-2xl bg-slate-800/60 p-4 flex items-center justify-between"
                  >
                    <div className="font-medium">
                      {expense.description ?? 'Expense'}
                    </div>
                    <div className="text-blue-400 font-semibold">
                      ${Number(expense.amount ?? 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Documents</h2>

            {imageDocs.length > 0 && (
              <div className="mb-6">
                <div className="text-slate-400 text-sm mb-2">Images</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {imageDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-2xl overflow-hidden bg-slate-800/60 p-1"
                    >
                      <a href={doc.file_url} target="_blank" rel="noreferrer">
                        <img
                          src={doc.file_url}
                          alt={doc.name ?? doc.file_name ?? 'Incident image'}
                          className="w-full h-48 object-cover rounded-xl"
                        />
                      </a>
                      <div className="p-2 text-xs text-slate-400 break-all">
                        {doc.name ?? doc.file_name ?? 'Image'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {otherDocs.length > 0 && (
              <div className="space-y-3">
                {otherDocs.map((doc) => (
                  <div key={doc.id} className="rounded-2xl bg-slate-800/60 p-4">
                    <div className="font-medium mb-2">
                      {doc.name ?? doc.file_name ?? 'Document'}
                    </div>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-xl border border-blue-800 bg-blue-950/50 px-3 py-2 text-sm font-medium text-blue-300 hover:bg-blue-900/50"
                      >
                        Open file
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {documents.length === 0 && (
              <div className="rounded-2xl bg-slate-800/40 p-4 text-slate-400">
                No documents attached.
              </div>
            )}
          </div>
        </div>
      </div>

      {openLetterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Generate AI Claim Letter</h3>
              <button
                onClick={() => setOpenLetterModal(false)}
                className="rounded-xl border border-slate-700 px-3 py-2 text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-slate-400 mb-2">Select language</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`rounded-xl px-4 py-2 border ${language === 'en' ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-300'}`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`rounded-xl px-4 py-2 border ${language === 'ar' ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-300'}`}
                >
                  🇸🇦 العربية
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`rounded-xl px-4 py-2 border ${language === 'es' ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-300'}`}
                >
                  🇪🇸 Español
                </button>
              </div>
            </div>

            <button
              onClick={generateLetter}
              disabled={loadingLetter}
              className="rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-3 font-semibold text-white mb-4"
            >
              {loadingLetter ? 'Generating...' : 'Generate'}
            </button>

            {letterError && (
              <div className="rounded-2xl border border-red-800 bg-red-950/40 p-4 text-red-300 mb-4">
                {letterError}
              </div>
            )}

            {serverEligibility && (
              <div className="rounded-2xl border border-indigo-800 bg-indigo-950/30 p-4 mb-4">
                <div className="font-semibold mb-2">Eligibility result</div>
                <div className="text-slate-300 text-sm">Status: {serverEligibility.status}</div>
                <div className="text-slate-300 text-sm">Framework: {serverEligibility.framework}</div>
                <div className="text-slate-300 text-sm">Confidence: {serverEligibility.confidence}</div>
                <div className="text-slate-400 text-sm mt-2">{serverEligibility.reason}</div>
                {serverEligibility.missingInfo?.length > 0 && (
                  <div className="text-slate-400 text-sm mt-2">
                    Missing info: {serverEligibility.missingInfo.join(', ')}
                  </div>
                )}
              </div>
            )}

            {generatedLetter && (
              <div>
                <textarea
                  value={generatedLetter}
                  readOnly
                  className="w-full min-h-[320px] rounded-2xl bg-slate-950 border border-slate-700 p-4 text-slate-200"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={copyLetter}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200"
                  >
                    Copy
                  </button>
                  <button
                    onClick={generateLetter}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
