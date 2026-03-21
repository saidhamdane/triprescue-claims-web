import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json({
    ok: true,
    message: 'Follow-up scaffold ready',
    incidentId: body?.incidentId || null,
  });
}
