export type ClaimRuleResult = {
  regime: 'EU261' | 'MONTREAL' | 'GENERAL';
  confidence: number;
  reason: string;
};

export function detectClaimRegime(input: {
  incidentType?: string;
  departureCountry?: string;
  arrivalCountry?: string;
  airlineCountry?: string;
}) : ClaimRuleResult {
  const type = String(input.incidentType || '').toLowerCase();
  const departure = String(input.departureCountry || '').toLowerCase();
  const arrival = String(input.arrivalCountry || '').toLowerCase();

  const euCountries = ['spain', 'france', 'germany', 'italy', 'portugal', 'belgium', 'netherlands', 'ireland'];

  const touchesEU = euCountries.includes(departure) || euCountries.includes(arrival);

  if (touchesEU && (type.includes('delay') || type.includes('cancel') || type.includes('boarding'))) {
    return {
      regime: 'EU261',
      confidence: 0.92,
      reason: 'Flight disruption touching the EU',
    };
  }

  if (type.includes('baggage') || type.includes('passport')) {
    return {
      regime: 'MONTREAL',
      confidence: 0.85,
      reason: 'Baggage or travel-document loss usually fits Montreal-style handling',
    };
  }

  return {
    regime: 'GENERAL',
    confidence: 0.55,
    reason: 'Fallback general travel-claim logic',
  };
}
