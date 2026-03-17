type Input = {
  language: 'en' | 'ar' | 'es';
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
  incident,
  expenses,
  documents,
  eligibility,
  flightStatus,
}: Input) {
  const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const langInstruction =
    language === 'ar'
      ? 'Write the letter in formal Arabic.'
      : language === 'es'
      ? 'Write the letter in formal Spanish.'
      : 'Write the letter in formal English.';

  const legalInstruction =
    eligibility.framework === 'EU261'
      ? 'Mention EU261 carefully and only as potentially applicable based on the available facts. Do not overclaim.'
      : eligibility.framework === 'Montreal Convention'
      ? 'Mention baggage compensation rules and the Montreal Convention carefully where appropriate.'
      : 'Use general professional complaint language without inventing legal entitlements.';

  return `
You are an expert airline claim assistant.

${langInstruction}

Write a polished, professional, ready-to-send airline claim letter.
Do not use markdown.
Do not invent facts.
Do not overstate legal certainty.
Use a firm but professional tone.
Request a written response within 14 days.

Legal guidance:
${legalInstruction}

Eligibility summary:
- Status: ${eligibility.status}
- Framework: ${eligibility.framework}
- Reason: ${eligibility.reason}
- Confidence: ${eligibility.confidence}
- Missing info: ${(eligibility.missingInfo || []).join(', ') || 'None'}

Incident details:
- Incident type: ${incident?.type || 'N/A'}
- Title: ${incident?.title || 'N/A'}
- Description: ${incident?.description || 'N/A'}
- Airline: ${incident?.airline || 'N/A'}
- Flight number: ${incident?.flight_number || 'N/A'}
- Booking / reference number: ${incident?.reference_number || 'N/A'}
- Claim amount: ${incident?.claim_amount || 0} ${incident?.currency || 'USD'}
- Additional expenses total: ${totalExpenses} ${incident?.currency || 'USD'}
- Number of supporting documents: ${(documents || []).length}

Flight verification data:
${flightStatus ? JSON.stringify(flightStatus, null, 2) : 'No live flight verification available'}

Requirements:
1. Include a subject line
2. Clearly describe the incident
3. Request compensation or reimbursement appropriate to the case
4. Mention that supporting documents/evidence are attached or available
5. Request a written reply within 14 days
6. End with a formal sign-off
`;
}
