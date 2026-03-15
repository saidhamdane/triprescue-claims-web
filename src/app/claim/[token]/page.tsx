import ClaimView from '@/components/ClaimView';
import ErrorView from '@/components/ErrorView';
import { getPublicClaimByToken } from '@/lib/get-public-claim';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function ClaimPage({ params }: PageProps) {
  const { token } = await params;
  const result = await getPublicClaimByToken(token);

  if (result.error) {
    return <ErrorView error={result.error} />;
  }

  return <ClaimView data={result.data} />;
}
