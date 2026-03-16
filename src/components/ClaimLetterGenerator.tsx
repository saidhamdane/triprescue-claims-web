'use client';

import { useState } from 'react';
import { ClaimData } from '../lib/get-public-claim';

type Language = 'en' | 'ar' | 'es';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export default function ClaimLetterGenerator({ data }: { data: ClaimData }) {
  const [language, setLanguage] = useState<Language>('en');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const generateLetter = async () => {
    setLoading(true); setError(''); setLetter('');
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident: data.incident, expenses: data.expenses, documents: data.documents, language }),
      });
      const result = await res.json();
      if (!res.ok || result.error) { setError(result.error || 'Failed'); return; }
      setLetter(result.letter);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const copyLetter = async () => {
    try { await navigator.clipboard.writeText(letter); } catch {
      const ta = document.createElement('textarea'); ta.value = letter; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  if (!showPanel) {
    return (
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <button onClick={() => setShowPanel(true)} style={{ width: '100%', padding: '14px 20px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
          ✨ Generate AI Claim Letter
        </button>
        <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>AI-powered formal letter ready to send to the airline</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#475569', margin: 0 }}>✨ AI Claim Letter</h2>
        <button onClick={() => { setShowPanel(false); setLetter(''); setError(''); }} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
      </div>

      {!letter && (<>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px' }}>Choose language:</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {languages.map((lang) => (
            <button key={lang.code} onClick={() => setLanguage(lang.code)} style={{ flex: 1, padding: '10px 8px', borderRadius: '10px', border: language === lang.code ? '2px solid #2563eb' : '2px solid #e2e8f0', background: language === lang.code ? '#eff6ff' : 'white', cursor: 'pointer', fontSize: '13px', fontWeight: language === lang.code ? 700 : 500, color: language === lang.code ? '#1d4ed8' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '20px' }}>{lang.flag}</span><span>{lang.label}</span>
            </button>
          ))}
        </div>
        <button onClick={generateLetter} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', fontSize: '14px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.3)' }}>
          {loading ? (<><span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span> Generating...</>) : (<>⚡ Generate Letter</>)}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>)}

      {error && <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', marginTop: '12px' }}><p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>⚠️ {error}</p></div>}

      {letter && (<div>
        <div style={{ background: '#fffef5', border: '1px solid #fef3c7', borderRadius: '12px', padding: '20px', maxHeight: '400px', overflowY: 'auto', marginBottom: '12px', direction: language === 'ar' ? 'rtl' : 'ltr' }}>
          <pre style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: "'DM Sans', sans-serif" }}>{letter}</pre>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={copyLetter} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: copied ? '#059669' : '#2563eb', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            {copied ? '✅ Copied!' : '📋 Copy Letter'}
          </button>
          <button onClick={() => { setLetter(''); setError(''); }} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🔄 Redo</button>
        </div>
        <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '10px' }}>
          Copy and send to {data.incident.airline || 'the airline'} customer service. Under EU261, airlines must respond within a reasonable timeframe.
        </p>
      </div>)}
    </div>
  );
}
