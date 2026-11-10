import { NextResponse } from "next/server";
import { storeService } from "@/lib/storeService";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Check if it's a quick stock increment / decrement
    if (body.action === "adjust_stock") {
      const delta = Number(body.delta) || 0;
      const updated = await storeService.adjustStock(id, delta);
      return NextResponse.json(updated);
    }

    const updated = await storeService.updateProduct(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await storeService.deleteProduct(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

