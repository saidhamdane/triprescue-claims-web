import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface ClaimData {
  incident: {
    id: string;
    trip_id: string | null;
    type: string;
    title: string;
    description: string;
    status: string;
    claim_amount: number;
    currency: string;
    reference_number: string | null;
    airline: string | null;
    flight_number: string | null;
    created_at: string;
    updated_at: string;
  };
  expenses: Array<{ id: string; description: string; amount: number; currency: string }>;
  documents: Array<{ id: string; name: string; type: string; file_url: string; created_at: string | null }>;
  shareText: string | null;
  expiresAt: string | null;
}

export async function getPublicClaim(token: string): Promise<{ data: ClaimData | null; error: string | null }> {
  try {
    const cleanToken = token.trim();

    // Step 1: share_links — NO is_active filter
    const { data: shareLink, error: slError } = await supabase
      .from('share_links').select('*').eq('token', cleanToken).maybeSingle();

    if (slError) { console.error('[share_links]', slError.message); return { data: null, error: 'Failed to look up claim link' }; }
    if (!shareLink) { return { data: null, error: 'This claim link is not valid' }; }
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) { return { data: null, error: 'This claim link has expired' }; }

    const incidentId = shareLink.incident_id;
    if (!incidentId) { return { data: null, error: 'No incident linked to this share link' }; }

    // Step 2: incident
    const { data: incident, error: incError } = await supabase
      .from('incidents').select('*').eq('id', incidentId).maybeSingle();

    if (incError) { console.error('[incidents]', incError.message); return { data: null, error: 'Failed to load claim details' }; }
    if (!incident) { return { data: null, error: 'Claim not found' }; }

    // Step 3: expenses — incident_id first, then trip_id
    let allExpenses: any[] = [];
    const { data: expByInc } = await supabase.from('incident_expenses').select('*').eq('incident_id', incidentId).order('created_at', { ascending: true });
    if (expByInc && expByInc.length > 0) { allExpenses = expByInc; }
    else if (incident.trip_id) {
      const { data: expByTrip } = await supabase.from('incident_expenses').select('*').eq('trip_id', incident.trip_id).order('created_at', { ascending: true });
      if (expByTrip && expByTrip.length > 0) { allExpenses = expByTrip; }
    }

    // Step 4: documents — incident_id + trip_id, NO user_id
    let allDocs: any[] = [];
    const { data: docsByInc } = await supabase.from('documents').select('*').eq('incident_id', incidentId).order('uploaded_at', { ascending: true });
    if (docsByInc && docsByInc.length > 0) { allDocs = [...docsByInc]; }
    if (incident.trip_id) {
      const { data: docsByTrip } = await supabase.from('documents').select('*').eq('trip_id', incident.trip_id).order('uploaded_at', { ascending: true });
      if (docsByTrip && docsByTrip.length > 0) {
        const ids = new Set(allDocs.map((d: any) => d.id));
        for (const doc of docsByTrip) { if (!ids.has(doc.id)) allDocs.push(doc); }
      }
    }

    return {
      data: {
        incident: {
          id: incident.id, trip_id: incident.trip_id || null,
          type: incident.type || 'travel_incident', title: incident.title || 'Travel Incident',
          description: incident.description || '', status: incident.status || 'open',
          claim_amount: incident.claim_amount || 0, currency: incident.currency || 'USD',
          reference_number: incident.reference_number || null,
          airline: incident.airline || null, flight_number: incident.flight_number || null,
          created_at: incident.created_at, updated_at: incident.updated_at || incident.created_at,
        },
        expenses: (allExpenses || []).map((e: any) => ({ id: e.id, description: e.description || 'Expense', amount: e.amount || 0, currency: e.currency || incident.currency || 'USD' })),
        documents: (allDocs || []).map((d: any) => ({ id: d.id, name: d.name || d.title || d.file_name || 'Document', type: d.type || d.document_type || 'file', file_url: d.file_url || d.url || d.storage_path || '', created_at: d.uploaded_at || d.created_at || null })),
        shareText: shareLink.text || null,
        expiresAt: shareLink.expires_at || null,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('[getPublicClaim]', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}
