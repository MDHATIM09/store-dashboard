import { NextResponse } from "next/server";
import { storeService } from "@/lib/storeService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await storeService.updateSale(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update sale:", error);
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const success = await storeService.deleteSale(id);
    if (!success) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Sale deleted and stock restored" });
  } catch (error) {
    console.error("Failed to delete sale:", error);
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}

