import { NextResponse } from "next/server";
import { generateReportPdf } from "@/lib/ai";
import type { ReportPayload } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as ReportPayload;

    if (!payload?.group || !payload?.expenses) {
      return NextResponse.json(
        { error: "Report payload incomplete" },
        { status: 400 },
      );
    }

    const buffer = await generateReportPdf(payload);
    const pdfBytes = new Uint8Array(buffer);
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBytes.length.toString(),
        "Content-Disposition": `attachment; filename="${payload.group.name
          .toLowerCase()
          .replace(/\s+/g, "-")}-report.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
