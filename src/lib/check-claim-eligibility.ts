export type EligibilityResult = {
  status: 'likely_eligible' | 'possibly_eligible' | 'insufficient_info' | 'unlikely_eligible';
  framework: 'EU261' | 'Montreal Convention' | 'General Claim';
  reason: string;
  missingInfo: string[];
  confidence: 'high' | 'medium' | 'low';
};

export function checkClaimEligibility(incident: any, expenses: any[] = []): EligibilityResult {
  const type = String(incident?.type || '').toLowerCase();
  const airline = String(incident?.airline || '');
  const flightNumber = String(incident?.flight_number || '');
  const ref = String(incident?.reference_number || '');
  const hasExpenses = Array.isArray(expenses) && expenses.length > 0;
  const missingInfo: string[] = [];

  if (!airline) missingInfo.push('Airline');
  if (!flightNumber) missingInfo.push('Flight number');

  if (['cancelled_flight', 'flight_delay', 'denied_boarding'].includes(type)) {
    if (!ref) missingInfo.push('Booking / reference number');

    return {
      status: missingInfo.length === 0 ? 'possibly_eligible' : 'insufficient_info',
      framework: 'EU261',
      reason:
        missingInfo.length === 0
          ? 'This incident type may qualify for compensation under EU261 depending on route, carrier, delay length, and extraordinary circumstances.'
          : 'This incident may fall under EU261, but some important details are missing.',
      missingInfo,
      confidence: missingInfo.length === 0 ? 'medium' : 'low',
    };
  }

  if (['lost_baggage', 'damaged_baggage', 'delayed_baggage', 'lost_passport'].includes(type)) {
    if (!ref) missingInfo.push('Reference / PIR number');

    return {
      status: hasExpenses || ref ? 'possibly_eligible' : 'insufficient_info',
      framework: 'Montreal Convention',
      reason:
        hasExpenses || ref
          ? 'This incident appears closer to a baggage-related compensation claim and may be pursued under baggage compensation rules and the Montreal Convention.'
          : 'This looks like a baggage-related claim, but stronger supporting details would improve the claim.',
      missingInfo,
      confidence: hasExpenses || ref ? 'medium' : 'low',
    };
  }

  return {
    status: 'possibly_eligible',
    framework: 'General Claim',
    reason:
      'This incident may support a direct complaint or reimbursement request, but the legal compensation framework is not fully clear from the available data.',
    missingInfo,
    confidence: 'low',
  };
}
