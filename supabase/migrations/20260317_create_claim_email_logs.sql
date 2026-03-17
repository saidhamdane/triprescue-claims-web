create table if not exists claim_email_logs (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid null,
  recipient_email text not null,
  subject text not null,
  status text not null default 'pending',
  provider text not null default 'resend',
  provider_message_id text null,
  error_message text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_claim_email_logs_incident_id
  on claim_email_logs (incident_id);

create index if not exists idx_claim_email_logs_created_at
  on claim_email_logs (created_at desc);
