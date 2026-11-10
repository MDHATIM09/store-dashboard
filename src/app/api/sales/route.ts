import { NextResponse } from "next/server";
import { storeService } from "@/lib/storeService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") as "today" | "week" | "month" | "all") || "all";
    const sales = await storeService.getSales(filter);
    return NextResponse.json(sales);
  } catch (error) {
    console.error("Failed to fetch sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, totalAmount, discount, paymentMode, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one product item is required for a sale" },
        { status: 400 }
      );
    }

    if (totalAmount === undefined || totalAmount === null || Number(totalAmount) < 0) {
      return NextResponse.json({ error: "Valid totalAmount is required" }, { status: 400 });
    }

    const sale = await storeService.createSale({
      items,
      totalAmount: Number(totalAmount),
      discount: Number(discount || 0),
      paymentMode: paymentMode === "ONLINE" ? "ONLINE" : "CASH",
      notes,
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Failed to record sale:", error);
    return NextResponse.json({ error: "Failed to record sale" }, { status: 500 });
  }
}

