type Input = {
  language: 'en' | 'ar' | 'es';
  tone?: 'short' | 'standard' | 'legal';
  incident: any;
  expenses: any[];
  documents: any[];
  eligibility: {
    status: string;
    framework: string;
    reason: string;
    missingInfo: string[];
    confidence: string;
  };
  flightStatus?: any;
};

export function buildClaimLetterPrompt({
  language,
  tone = 'standard',
  incident,
  expenses,
  documents,
  eligibility,
  flightStatus,
}: Input) {
  const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const langInstruction =
    language === 'ar'
      ? 'Write the letter in formal professional Arabic.'
      : language === 'es'
      ? 'Write the letter in formal professional Spanish.'
      : 'Write the letter in formal professional English.';

  const toneInstruction =
    tone === 'short'
      ? 'Keep the letter concise, practical, and under 250 words if possible.'
      : tone === 'legal'
      ? 'Use a stronger legal-professional tone, but do not overclaim or invent rights.'
      : 'Use a balanced professional tone suitable for an airline claims department.';

  const legalInstruction =
    eligibility.framework === 'EU261'
      ? 'If appropriate, mention EU261 carefully as a possible basis for compensation. Do not overstate certainty.'
      : eligibility.framework === 'Montreal Convention'
      ? 'If appropriate, mention baggage compensation principles and the Montreal Convention carefully.'
      : 'Use general professional complaint language without inventing legal entitlements.';

  const passengerName =
    incident?.passenger_name ||
    incident?.full_name ||
    incident?.user_name ||
    incident?.name ||
    '[Passenger Name]';

  const passengerEmail =
    incident?.email ||
    incident?.passenger_email ||
    '[Passenger Email]';

  const requestedAmount = Number(incident?.claim_amount || 0);
  const currency = incident?.currency || 'USD';
  const docsCount = (documents || []).length;

  return `
You are an expert airline claims writer.

${langInstruction}
${toneInstruction}

Write a polished, realistic, ready-to-send claim letter.
Do not use markdown.
Do not use bullet points unless absolutely necessary.
Do not invent facts.
Do not overstate legal certainty.
Do not mention internal AI analysis.
Avoid repetitive wording.
Keep the structure clean and readable.

Legal guidance:
${legalInstruction}

Eligibility summary:
- Status: ${eligibility.status}
- Framework: ${eligibility.framework}
- Reason: ${eligibility.reason}
- Confidence: ${eligibility.confidence}
- Missing info: ${(eligibility.missingInfo || []).join(', ') || 'None'}

Passenger details:
- Name: ${passengerName}
- Email: ${passengerEmail}

Incident details:
- Incident type: ${incident?.type || 'N/A'}
- Title: ${incident?.title || 'N/A'}
- Description: ${incident?.description || 'N/A'}
- Airline: ${incident?.airline || 'N/A'}
- Flight number: ${incident?.flight_number || 'N/A'}
- Booking / reference number: ${incident?.reference_number || 'N/A'}
- Claim amount requested: ${requestedAmount} ${currency}
- Additional expenses total: ${totalExpenses} ${currency}
- Supporting documents count: ${docsCount}

Flight verification data:
${flightStatus ? JSON.stringify(flightStatus, null, 2) : 'No live flight verification available'}

Requirements:
1. Start with a clean subject line beginning with "Subject:"
2. Address the airline claims team professionally
3. Briefly explain the incident
4. State the requested compensation or reimbursement clearly
5. Mention that supporting documents are attached or available
6. Request a written response within 14 days
7. End with a professional sign-off
8. Use placeholders only when necessary
9. Keep the wording natural and credible for a real complaint email

Return only the final letter.
`;
}
