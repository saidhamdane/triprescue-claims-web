import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const { incident, expenses, documents, language } = await request.json();

    const langInstruction: Record<string, string> = {
      en: 'Write the letter in professional English.',
      ar: 'Write the letter in professional Arabic (العربية الفصحى). Use right-to-left formatting cues.',
      es: 'Write the letter in professional Spanish (Castellano).',
    };

    const expenseList = expenses.length > 0
      ? expenses.map((e: any) => `- ${e.description}: ${e.currency} ${e.amount}`).join('\n')
      : 'No additional expenses recorded.';

    const docList = documents.length > 0
      ? documents.map((d: any) => `- ${d.name} (${d.type})`).join('\n')
      : 'No supporting documents.';

    const isFlightRelated = ['delayed_flight', 'cancelled_flight', 'lost_baggage'].includes(incident.type);

    const systemPrompt = `You are an expert travel compensation advisor and professional letter writer. You help travelers write formal compensation claim letters to airlines and travel companies.

Your letters are:
- Professional and firm but polite
- Legally informed (citing EU261/2004 regulation when applicable for European flights)
- Well-structured with clear demands
- Include all relevant incident details
- Request specific compensation amounts
- Set a reasonable deadline for response (14 days)
- Mention escalation to national enforcement bodies if no response

${langInstruction[language] || langInstruction.en}`;

    const userPrompt = `Generate a professional compensation claim letter for the following incident:

INCIDENT TYPE: ${incident.type.replace(/_/g, ' ').toUpperCase()}
TITLE: ${incident.title}
DESCRIPTION: ${incident.description}
${incident.airline ? `AIRLINE: ${incident.airline}` : ''}
${incident.flight_number ? `FLIGHT NUMBER: ${incident.flight_number}` : ''}
DATE OF INCIDENT: ${new Date(incident.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
${incident.reference_number ? `REFERENCE NUMBER: ${incident.reference_number}` : ''}
CLAIM AMOUNT: ${incident.currency} ${incident.claim_amount}

ADDITIONAL EXPENSES:
${expenseList}

SUPPORTING DOCUMENTS ATTACHED:
${docList}

${isFlightRelated ? 'This may fall under EU Regulation 261/2004. Include relevant EU261 rights if applicable (compensation of €250-€600 based on flight distance for delays over 3 hours, cancellations, or denied boarding).' : ''}

Write the complete letter ready to send. Use [PASSENGER NAME] and [PASSENGER ADDRESS] as placeholders. Address it to the airline customer service department.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      console.error('[Claude API]', response.status, await response.text());
      return NextResponse.json({ error: 'Failed to generate letter' }, { status: 500 });
    }

    const data = await response.json();
    const letterText = data.content?.[0]?.text || '';
    if (!letterText) return NextResponse.json({ error: 'No letter generated' }, { status: 500 });

    return NextResponse.json({ letter: letterText });
  } catch (err: any) {
    console.error('[generate-letter]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
