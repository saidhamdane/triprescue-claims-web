import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export type ClaimData = {
  incident: any;
  expenses: any[];
  documents: any[];
  shareText: string | null;
  expiresAt: string | null;
};

export async function getPublicClaim(
  token: string
): Promise<{ data: ClaimData | null; error: string | null }> {
  noStore();

  try {
    const cleanToken = token.trim();

    const { data: shareLink, error: slError } = await supabase
      .from('share_links')
      .select('*')
      .eq('token', cleanToken)
      .maybeSingle();

    if (slError || !shareLink) {
      return { data: null, error: 'This claim link is not valid' };
    }

    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return { data: null, error: 'This claim link has expired' };
    }

    const incidentId = shareLink.incident_id;
    if (!incidentId) {
      return { data: null, error: 'No incident linked to this share link' };
    }

    const { data: incident, error: incError } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .maybeSingle();

    if (incError || !incident) {
      return { data: null, error: 'Claim not found' };
    }

    let expenses: any[] = [];
    const { data: expensesByIncident } = await supabase
      .from('incident_expenses')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true });

    if (expensesByIncident && expensesByIncident.length > 0) {
      expenses = expensesByIncident;
    } else if (incident.trip_id) {
      const { data: expensesByTrip } = await supabase
        .from('incident_expenses')
        .select('*')
        .eq('trip_id', incident.trip_id)
        .order('created_at', { ascending: true });
      expenses = expensesByTrip ?? [];
    }

    const { data: docsByIncident } = await supabase
      .from('documents')
      .select('*')
      .eq('incident_id', incident.id)
      .order('uploaded_at', { ascending: true });

    let allDocuments = docsByIncident ?? [];

    if (incident.trip_id) {
      const { data: docsByTrip } = await supabase
        .from('documents')
        .select('*')
        .eq('trip_id', incident.trip_id)
        .order('uploaded_at', { ascending: true });

      const seen = new Set(allDocuments.map((d: any) => d.id));
      for (const doc of docsByTrip ?? []) {
        if (!seen.has(doc.id)) {
          allDocuments.push(doc);
        }
      }
    }

    return {
      data: {
        incident: {
          id: incident.id,
          trip_id: incident.trip_id || null,
          type: incident.type || 'travel_incident',
          title: incident.title || 'Travel Incident',
          description: incident.description || '',
          status: incident.status || 'open',
          claim_amount: incident.claim_amount || 0,
          currency: incident.currency || 'USD',
          reference_number: incident.reference_number || null,
          airline: incident.airline || null,
          flight_number: incident.flight_number || null,
          created_at: incident.created_at,
          updated_at: incident.updated_at || incident.created_at,
        },
        expenses: (expenses || []).map((e: any) => ({
          id: e.id,
          description: e.description || 'Expense',
          amount: e.amount || 0,
          currency: e.currency || incident.currency || 'USD',
        })),
        documents: (allDocuments || []).map((d: any) => ({
          id: d.id,
          name: d.name || d.title || d.file_name || 'Document',
          type: d.type || d.document_type || 'file',
          file_url: d.file_url || d.url || d.storage_path || '',
          created_at: d.uploaded_at || d.created_at || null,
        })),
        shareText: shareLink.text || null,
        expiresAt: shareLink.expires_at || null,
      },
      error: null,
    };
  } catch (err) {
    console.error('[getPublicClaim] Unexpected error:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}
