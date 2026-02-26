import { NextResponse } from "next/server";
import { buildGDPRTjekliste } from "@/lib/documents/gdpr-tjekliste";

export async function GET() {
  try {
    const buffer = await buildGDPRTjekliste();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          'attachment; filename="GDPR-Tjekliste-Retsklar.docx"',
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("[Ressourcer] GDPR tjekliste generation failed:", error);
    return NextResponse.json({ error: "Kunne ikke generere fil" }, { status: 500 });
  }
}
