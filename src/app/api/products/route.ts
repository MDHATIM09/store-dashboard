import { NextResponse } from "next/server";
import { storeService } from "@/lib/storeService";

export async function GET() {
  try {
    const products = await storeService.getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, costPrice, sellingPrice, stock, lowStockThreshold, category } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const newProduct = await storeService.addProduct({
      name,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      stock: Number(stock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 3,
      category,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Failed to add product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

