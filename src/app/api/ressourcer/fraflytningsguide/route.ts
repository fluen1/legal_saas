import { NextResponse } from "next/server";
import { buildFraflytningsguide } from "@/lib/documents/fraflytningsguide";

export async function GET() {
  try {
    const buffer = await buildFraflytningsguide();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          'attachment; filename="Fraflytningsguide-Retsklar.docx"',
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("[Ressourcer] Fraflytningsguide generation failed:", error);
    return NextResponse.json({ error: "Kunne ikke generere fil" }, { status: 500 });
  }
}
