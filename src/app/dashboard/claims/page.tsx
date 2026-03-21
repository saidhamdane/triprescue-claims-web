import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function ClaimsDashboardPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: claims } = await supabase
    .from('claim_messages')
    .select('id, incident_id, recipient_email, subject, attachments_count, send_status, sent_at, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main style={{ maxWidth: 1100, margin: '40px auto', padding: 20 }}>
      <h1>Claims Dashboard</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Incident</th>
            <th align="left">Recipient</th>
            <th align="left">Subject</th>
            <th align="left">Attachments</th>
            <th align="left">Status</th>
            <th align="left">Sent At</th>
          </tr>
        </thead>
        <tbody>
          {(claims || []).map((row: any) => (
            <tr key={row.id}>
              <td>{row.incident_id}</td>
              <td>{row.recipient_email}</td>
              <td>{row.subject}</td>
              <td>{row.attachments_count}</td>
              <td>{row.send_status}</td>
              <td>{row.sent_at || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
