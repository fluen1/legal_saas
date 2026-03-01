import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateReportPDF } from '@/lib/pdf/generate-report-pdf';
import type { HealthCheckReport } from '@/types/report';
import { createLogger } from '@/lib/logger';

const log = createLogger('PDF');

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID mangler' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('health_checks')
      .select('report, payment_status, email')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Rapport ikke fundet' }, { status: 404 });
    }

    if (data.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Betaling påkrævet for at downloade PDF' },
        { status: 403 },
      );
    }

    // Ownership verification: match logged-in user email to health check email
    const userSupabase = await createServerSupabaseClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user?.email || user.email.toLowerCase() !== data.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'Adgang nægtet' },
        { status: 403 },
      );
    }

    if (!data.report) {
      return NextResponse.json({ error: 'Rapport ikke genereret endnu' }, { status: 404 });
    }

    const report = data.report as unknown as HealthCheckReport;
    const pdfBytes = await generateReportPDF(report);

    const date = new Date().toISOString().split('T')[0];
    const filename = `retsklar-rapport-${date}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (err) {
    log.error('Generation error:', err);
    return NextResponse.json(
      { error: 'Kunne ikke generere PDF' },
      { status: 500 },
    );
  }
}
