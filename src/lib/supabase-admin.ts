import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const serviceRole =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  '';

if (!url) {
  console.warn('[supabase-admin] Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!serviceRole) {
  console.warn('[supabase-admin] Missing SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(url, serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
