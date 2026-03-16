import { getPublicClaim } from '../../../lib/get-public-claim';
import ClaimView from '../../../components/ClaimView';
import ErrorView from '../../../components/ErrorView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function ClaimPage({ params }: PageProps) {
  const { token } = await params;
  const { data, error } = await getPublicClaim(token);

  if (error || !data) {
    return <ErrorView message={error || 'Claim not found'} />;
  }

  return <ClaimView data={data} />;
}
