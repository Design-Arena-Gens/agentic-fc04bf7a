import { NextResponse } from "next/server";
import { analyseReceipt } from "@/lib/ai";

async function fileToBase64(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let base64: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (file instanceof File) {
        base64 = await fileToBase64(file);
      }
    } else {
      const { image } = (await req.json()) as { image: string };
      base64 = image;
    }

    if (!base64) {
      return NextResponse.json(
        { error: "Receipt image required" },
        { status: 400 },
      );
    }

    const result = await analyseReceipt(base64);
    return NextResponse.json({ receipt: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to analyse receipt" },
      { status: 500 },
    );
  }
}
