import { NextRequest, NextResponse } from 'next/server';
import { getBillingAccessByEmail } from '../../../../lib/billing/access';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');
    const access = await getBillingAccessByEmail(email);

    return NextResponse.json({
      ok: true,
      access,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to load billing status' },
      { status: 500 }
    );
  }
}
