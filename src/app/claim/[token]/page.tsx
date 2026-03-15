import ClaimView from '../../../components/ClaimView';
import ErrorView from '../../../components/ErrorView';
import { getPublicClaimByToken } from '../../../lib/get-public-claim';

export default async function ClaimTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await getPublicClaimByToken(token);

  if (result.error === 'invalid') {
    return <ErrorView message="Invalid or revoked link." />;
  }

  if (result.error === 'expired') {
    return <ErrorView message="This link has expired." />;
  }

  if (result.error === 'not_found' || !result.data) {
    return <ErrorView message="Claim not found." />;
  }

  return <ClaimView data={result.data} />;
}
