import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID mangler' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('health_checks')
      .select('report, tier, overall_score, status, payment_status')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Rapport ikke fundet' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Kunne ikke hente rapport' },
      { status: 500 }
    );
  }
}
