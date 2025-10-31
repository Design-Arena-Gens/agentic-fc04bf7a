import { NextResponse } from "next/server";
import { optimiseSettlement } from "@/lib/ai";
import type { BalanceSummary } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { balances, currency } = (await req.json()) as {
      balances: BalanceSummary[];
      currency: string;
    };

    if (!balances?.length) {
      return NextResponse.json(
        { error: "Balances required" },
        { status: 400 },
      );
    }

    const plan = await optimiseSettlement(balances, currency ?? "USD");
    return NextResponse.json({ plan });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to optimise settlement" },
      { status: 500 },
    );
  }
}
