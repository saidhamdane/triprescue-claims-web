import { NextResponse } from 'next/server';
import { getPublicClaim } from '../../../../../../src/lib/get-public-claim';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const result = await getPublicClaim(params.token);
  return NextResponse.json(result);
}
