let cachedToken: { accessToken: string; expiresAt: number } | null = null;

export async function getAmadeusToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing AMADEUS_CLIENT_ID or AMADEUS_CLIENT_SECRET');
  }

  const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error_description || 'Failed to get Amadeus token');

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in || 1800) - 60) * 1000,
  };

  return cachedToken.accessToken;
}

export async function lookupFlightStatus({
  carrierCode,
  flightNumber,
  scheduledDepartureDate,
}: {
  carrierCode: string;
  flightNumber: string;
  scheduledDepartureDate: string;
}) {
  const token = await getAmadeusToken();

  const url = new URL('https://test.api.amadeus.com/v2/schedule/flights');
  url.searchParams.set('carrierCode', carrierCode);
  url.searchParams.set('flightNumber', flightNumber);
  url.searchParams.set('scheduledDepartureDate', scheduledDepartureDate);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || 'Flight status lookup failed');

  return JSON.parse(text);
}
