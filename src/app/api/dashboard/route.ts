import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Ikke logget ind' }, { status: 401 });
    }

    // Query by user_id (preferred) or email (fallback for legacy data)
    const { data, error } = await supabase
      .from('health_checks')
      .select('id, email, answers, overall_score, status, payment_status, tier, created_at')
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Dashboard API] Supabase error:', error);
      return NextResponse.json({ error: 'Kunne ikke hente data' }, { status: 500 });
    }

    return NextResponse.json({ checks: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Serverfejl' }, { status: 500 });
  }
}
