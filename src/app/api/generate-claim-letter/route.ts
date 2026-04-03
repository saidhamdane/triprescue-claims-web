import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildClaimLetterPrompt } from '../../../lib/build-claim-letter-prompt';
import { checkClaimEligibility } from '../../../lib/check-claim-eligibility';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, tone, incident, expenses, documents, flightStatus } = body || {};

    // Inject real user name/email from Supabase auth token
    try {
      const authHeader = req.headers.get('authorization') || '';
      const token = authHeader.replace('Bearer ', '').trim();
      if (token && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          const { data: profile } = await sb
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()
            .catch(() => ({ data: null }));
          const realName = profile?.full_name || user.email?.split('@')[0] || '';
          const realEmail = user.email || '';
          if (!incident.passenger_name && realName) incident.passenger_name = realName;
          if (!incident.email && realEmail) incident.email = realEmail;
        }
      }
    } catch (_) {}
   
    if (!incident.passenger_name) incident.passenger_name = req.headers.get('x-user-name') || '';
    if (!incident.email) incident.email = req.headers.get('x-user-email') || '';
    if (!language || !incident) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const eligibility = checkClaimEligibility(incident, expenses || []);
    const prompt = buildClaimLetterPrompt({
      language,
      tone: tone || 'standard',
      incident,
      expenses: expenses || [],
      documents: documents || [],
      eligibility,
      flightStatus,
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      return NextResponse.json({ error: `Claude API error: ${text}` }, { status: 500 });
    }

    const data = JSON.parse(text);
    const letter = data?.content?.[0]?.text || '';

    return NextResponse.json({ eligibility, letter });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}
// patch applied below - see inline fix
