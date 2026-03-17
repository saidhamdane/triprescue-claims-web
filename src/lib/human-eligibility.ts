export function humanEligibilityStatus(status?: string) {
  switch (status) {
    case 'likely_eligible':
      return 'Likely eligible';
    case 'possibly_eligible':
      return 'Possibly eligible';
    case 'insufficient_info':
      return 'More information needed';
    case 'unlikely_eligible':
      return 'Unlikely eligible';
    default:
      return status || 'Unknown';
  }
}

export function buildSuggestedSubject(incident: any) {
  const airline = incident?.airline || 'Airline';
  const flight = incident?.flight_number || 'N/A';
  const type = String(incident?.type || 'claim').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  return `Subject: ${type} Claim – ${airline} / Flight ${flight}`;
}
