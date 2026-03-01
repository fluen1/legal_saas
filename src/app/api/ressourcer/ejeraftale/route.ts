import { NextRequest, NextResponse } from "next/server";
import { buildEjeraftale } from "@/lib/documents/ejeraftale";
import { rateLimit } from "@/lib/rate-limit";
import { createLogger } from "@/lib/logger";

const log = createLogger("Ressourcer");

export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request, { maxRequests: 10, windowMs: 60_000, prefix: 'res-ejer' });
    if (limited) return limited;
    const buffer = await buildEjeraftale();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          'attachment; filename="Ejeraftale-Skabelon-Retsklar.docx"',
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    log.error("Ejeraftale generation failed:", error);
    return NextResponse.json({ error: "Kunne ikke generere fil" }, { status: 500 });
  }
}
