import { NextResponse } from "next/server";
import { generateInsightsFromGemini } from "@/lib/ai";
import type { Expense, Group } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { group, expenses } = (await req.json()) as {
      group: Group;
      expenses: Expense[];
    };

    if (!group || !expenses) {
      return NextResponse.json(
        { error: "Group and expenses are required" },
        { status: 400 },
      );
    }

    const insights = await generateInsightsFromGemini(group, expenses);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 },
    );
  }
}
