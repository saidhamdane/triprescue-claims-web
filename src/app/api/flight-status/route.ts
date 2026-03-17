import { NextRequest, NextResponse } from 'next/server';
import { lookupFlightStatus } from '../../../lib/amadeus';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { carrierCode, flightNumber, scheduledDepartureDate } = await req.json();

    if (!carrierCode || !flightNumber || !scheduledDepartureDate) {
      return NextResponse.json(
        { error: 'Missing carrierCode, flightNumber, or scheduledDepartureDate' },
        { status: 400 }
      );
    }

    const data = await lookupFlightStatus({
      carrierCode,
      flightNumber,
      scheduledDepartureDate,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Flight lookup failed' },
      { status: 500 }
    );
  }
}
