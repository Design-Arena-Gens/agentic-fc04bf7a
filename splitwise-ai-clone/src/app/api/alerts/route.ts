import { NextResponse } from "next/server";
import { sendBudgetAlertEmail } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { email, subject, html } = (await req.json()) as {
      email: string;
      subject: string;
      html: string;
    };

    if (!email) {
      return NextResponse.json(
        { error: "Recipient email required" },
        { status: 400 },
      );
    }

    const result = await sendBudgetAlertEmail({
      to: email,
      subject:
        subject ??
        "Budget alert: your shared expenses are nearing the configured threshold",
      html:
        html ??
        "<p>Heads up! Your latest spending run is approaching the limit you configured.</p>",
    });

    return NextResponse.json({ status: "queued", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to trigger alert" },
      { status: 500 },
    );
  }
}
