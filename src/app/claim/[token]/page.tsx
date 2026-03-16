import { getPublicClaim } from '../../../lib/get-public-claim';
import ClaimView from '../../../components/ClaimView';
import ErrorView from '../../../components/ErrorView';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface PageProps { params: { token: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data } = await getPublicClaim(params.token);
  if (!data) return { title: 'TripRescue — Claim Not Found' };
  return { title: `TripRescue — ${data.incident.title}`, description: `${data.incident.type.replace(/_/g, ' ')} claim` };
}

export default async function ClaimPage({ params }: PageProps) {
  const { token } = params;
  if (!token) return <ErrorView message="No claim token provided" />;
  const { data, error } = await getPublicClaim(token);
  if (error || !data) return <ErrorView message={error || 'Claim not found'} />;
  return <ClaimView data={data} />;
}
