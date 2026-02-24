/**
 * GET /api/health-check/[id]/status
 * Polling endpoint for analysis progress.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STEPS: Record<string, number> = {
  pending: 0,
  profiling: 0.1,
  analyzing: 0.35,
  orchestrating: 0.85,
  verifying: 0.95,
  complete: 1,
  error: 1,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID mangler" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("health_checks")
      .select("status, analysis_status, analysis_step")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Rapport ikke fundet" }, { status: 404 });
    }

    const status = (data.analysis_status as string) ?? "pending";
    const progress = STEPS[status] ?? 0;

    return NextResponse.json({
      status: data.status,
      analysisStatus: status,
      step: data.analysis_step ?? "",
      progress,
    });
  } catch {
    return NextResponse.json(
      { error: "Kunne ikke hente status" },
      { status: 500 }
    );
  }
}
