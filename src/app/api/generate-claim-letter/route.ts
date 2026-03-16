import { NextRequest, NextResponse } from 'next/server';
import { buildClaimLetterPrompt } from '../../../lib/build-claim-letter-prompt';
import { checkClaimEligibility } from '../../../lib/check-claim-eligibility';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, incident, expenses, documents } = body || {};

    if (!language || !incident) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const eligibility = checkClaimEligibility(incident, expenses || []);
    const prompt = buildClaimLetterPrompt({
      language,
      incident,
      expenses: expenses || [],
      documents: documents || [],
      eligibility,
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing ANTHROPIC_API_KEY' },
        { status: 500 }
      );
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
        max_tokens: 1400,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Claude API error: ${text}` },
        { status: 500 }
      );
    }

    const data = JSON.parse(text);
    const letter = data?.content?.[0]?.text || '';

    return NextResponse.json({
      eligibility,
      letter,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
