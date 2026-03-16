import { unstable_noStore as noStore } from 'next/cache';
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

function sortDocs(items: any[]) {
  return [...items].sort((a, b) => {
    const ad = new Date(a?.uploaded_at ?? a?.created_at ?? 0).getTime();
    const bd = new Date(b?.uploaded_at ?? b?.created_at ?? 0).getTime();
    return ad - bd;
  });
}

function dedupeDocs(items: any[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = String(item?.id ?? item?.file_url ?? Math.random());
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getPublicClaimByToken(
  token: string
): Promise<PublicClaimResult> {
  noStore();

  const cleanToken = token.trim();

  const { data: shareLink, error: shareError } = await supabaseAdmin
    .from('share_links')
    .select('*')
    .eq('token', cleanToken)
    .single();

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

  if (incidentError || !incident) {
    return { error: 'not_found', data: null };
  }

  const { data: expenses } = await supabaseAdmin
    .from('incident_expenses')
    .select('*')
    .eq('trip_id', incident.trip_id)
    .order('created_at', { ascending: true });

  const { data: docsByIncident, error: docsByIncidentError } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('incident_id', incident.id)
    .order('uploaded_at', { ascending: true });

  const { data: docsByTrip, error: docsByTripError } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('trip_id', incident.trip_id)
    .order('uploaded_at', { ascending: true });

  const mergedDocuments = sortDocs(
    dedupeDocs([...(docsByIncident ?? []), ...(docsByTrip ?? [])])
  );

  console.log('DEBUG incident.id:', incident?.id);
  console.log('DEBUG incident.trip_id:', incident?.trip_id);
  console.log('DEBUG docsByIncidentError:', docsByIncidentError);
  console.log('DEBUG docsByTripError:', docsByTripError);
  console.log('DEBUG docsByIncident count:', docsByIncident?.length ?? 0);
  console.log('DEBUG docsByTrip count:', docsByTrip?.length ?? 0);
  console.log('DEBUG mergedDocuments count:', mergedDocuments.length);

  return {
    error: null,
    data: {
      shareLink,
      incident,
      expenses: expenses ?? [],
      documents: mergedDocuments,
    },
  };
}
