import { createClient } from '@supabase/supabase-js';

export type PlanKey = 'free' | 'pro' | 'premium';

export type BillingAccess = {
  email: string | null;
  plan: PlanKey;
  status: string | null;
  isActive: boolean;
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !key) {
    throw new Error('Missing Supabase admin env vars');
  }

  return createClient(url, key);
}

export async function getBillingAccessByEmail(email?: string | null): Promise<BillingAccess> {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    return {
      email: null,
      plan: 'free',
      status: null,
      isActive: false,
    };
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('billing_subscriptions')
    .select('email, plan_key, status, updated_at')
    .eq('email', normalizedEmail)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      email: normalizedEmail,
      plan: 'free',
      status: null,
      isActive: false,
    };
  }

  const status = data.status || null;
  const plan = (data.plan_key || 'free') as PlanKey;
  const isActive = status === 'active' || status === 'trialing';

  return {
    email: normalizedEmail,
    plan: isActive ? plan : 'free',
    status,
    isActive,
  };
}

export function canSendClaims(access: BillingAccess) {
  return access.plan === 'pro' || access.plan === 'premium';
}

export function canUseFollowUps(access: BillingAccess) {
  return access.plan === 'premium';
}
