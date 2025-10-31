import { NextResponse } from "next/server";
import { chatWithAssistant } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { messages, language } = (await req.json()) as {
      messages: string[];
      language?: string;
    };

    if (!messages?.length) {
      return NextResponse.json(
        { error: "Messages array required" },
        { status: 400 },
      );
    }

    const reply = await chatWithAssistant(messages, language);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
