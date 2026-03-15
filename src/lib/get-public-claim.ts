import { supabaseAdmin } from './supabase-admin';

export type PublicClaimResult =
  | { error: 'invalid' | 'expired' | 'not_found'; data: null }
  | {
      error: null;
      data: {
        shareLink: any;
        incident: any;
        expenses: any[];
        documents: any[];
      };
    };

export async function getPublicClaimByToken(
  token: string
): Promise<PublicClaimResult> {
  const cleanToken = token.trim();

  const { data: shareLink, error: shareError } = await supabaseAdmin
    .from('share_links')
    .select('*')
    .eq('token', cleanToken)
    .single();

  console.log('DEBUG token:', cleanToken);
  console.log('DEBUG shareLink:', shareLink);
  console.log('DEBUG shareError:', shareError);

  if (shareError || !shareLink) {
    return { error: 'invalid', data: null };
  }

  if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
    return { error: 'expired', data: null };
  }

  const { data: incident, error: incidentError } = await supabaseAdmin
    .from('incidents')
    .select('*')
    .eq('id', shareLink.incident_id)
    .single();

  console.log('DEBUG incident:', incident);
  console.log('DEBUG incidentError:', incidentError);

  if (incidentError || !incident) {
    return { error: 'not_found', data: null };
  }

  const { data: expenses, error: expensesError } = await supabaseAdmin
    .from('incident_expenses')
    .select('*')
    .eq('trip_id', incident.trip_id)
    .order('created_at', { ascending: true });

  console.log('DEBUG expensesError:', expensesError);

  const { data: documents, error: documentsError } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('incident_id', incident.id)
    .order('created_at', { ascending: true });

  console.log('DEBUG documentsError:', documentsError);

  return {
    error: null,
    data: {
      shareLink,
      incident,
      expenses: expenses ?? [],
      documents: documents ?? [],
    },
  };
}
