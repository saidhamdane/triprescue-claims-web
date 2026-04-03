import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.replace('Bearer ', '').trim();
    if (!token) return NextResponse.json({ isPro: false, plan: 'free' });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ isPro: false, plan: 'free' });

    const { data } = await supabase
      .from('user_subscriptions')
      .select('status, plan')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    return NextResponse.json({
      isPro: !!data,
      plan: data?.plan || 'free'
    });
  } catch {
    return NextResponse.json({ isPro: false, plan: 'free' });
  }
}
