import { NextResponse } from "next/server";
import { buildEjeraftale } from "@/lib/documents/ejeraftale";

export async function GET() {
  try {
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
    console.error("[Ressourcer] Ejeraftale generation failed:", error);
    return NextResponse.json({ error: "Kunne ikke generere fil" }, { status: 500 });
  }
}
