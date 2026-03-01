/**
 * POST /api/admin/update-laws
 * GET /api/admin/update-laws?secret={ADMIN_SECRET} (for Vercel cron)
 * Opdaterer lovdatabasen fra retsinformation.dk.
 */

import { NextResponse } from "next/server";
import { updateLawsDatabase } from "@/lib/laws/fetch-laws-core";
import { createLogger } from "@/lib/logger";

const log = createLogger("update-laws");

async function handleUpdate() {
  try {
    const baseDir = process.cwd();
    const result = await updateLawsDatabase({
      baseDir,
      onlyNewer: true,
      onLog: (msg) => log.info(msg),
    });

    return NextResponse.json({
      updated: result.updated,
      unchanged: result.unchanged,
      errors: result.errors,
      totalTime: result.totalTime,
    });
  } catch (err) {
    log.error("Fejl:", err);
    return NextResponse.json(
      { error: "Opdatering fejlede", details: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const url = new URL(request.url);
  const cronSecret = url.searchParams.get("secret");
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || (token !== adminSecret && cronSecret !== adminSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return handleUpdate();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || secret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return handleUpdate();
}
