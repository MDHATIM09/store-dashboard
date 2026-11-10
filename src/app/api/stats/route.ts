import { NextResponse } from "next/server";
import { storeService } from "@/lib/storeService";

export async function GET() {
  try {
    const stats = await storeService.getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

