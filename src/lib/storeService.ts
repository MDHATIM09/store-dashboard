import fs from "fs";
import path from "path";
import { prisma } from "./prisma";

export interface ProductItem {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleRecordItem {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitCostPrice: number;
  unitSellingPrice: number;
  subtotal: number;
}

export interface SaleRecord {
  id: string;
  totalAmount: number;
  totalCost: number;
  profit: number;
  discount: number;
  paymentMode: "CASH" | "ONLINE";
  notes?: string;
  createdAt: string;
  items: SaleRecordItem[];
}

interface LocalStoreData {
  products: ProductItem[];
  sales: SaleRecord[];
}

const DATA_FILE_PATH = path.join(process.cwd(), "data", "store_data.json");

// Default initial starter products for immediate testing
const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "p1",
    name: "Tata Tea Gold (500g)",
    costPrice: 220,
    sellingPrice: 260,
    stock: 14,
    lowStockThreshold: 4,
    category: "Grocery",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p2",
    name: "Fortune Sunflower Oil (1L)",
    costPrice: 115,
    sellingPrice: 135,
    stock: 8,
    lowStockThreshold: 4,
    category: "Grocery",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p3",
    name: "Maggi 2-Minute Noodles (Pack of 4)",
    costPrice: 42,
    sellingPrice: 50,
    stock: 2, // Low stock demo (< 4)
    lowStockThreshold: 4,
    category: "Snacks",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p4",
    name: "Surf Excel Detergent Bar (200g)",
    costPrice: 28,
    sellingPrice: 35,
    stock: 3, // Low stock demo (< 4)
    lowStockThreshold: 4,
    category: "Cleaning",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p5",
    name: "Britannia Good Day Butter (100g)",
    costPrice: 18,
    sellingPrice: 25,
    stock: 20,
    lowStockThreshold: 5,
    category: "Biscuits",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p6",
    name: "Lakmé Eyeconic Kajal (Deep Black)",
    costPrice: 140,
    sellingPrice: 185,
    stock: 15,
    lowStockThreshold: 5,
    category: "Cosmetics",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p7",
    name: "Maybelline Fit Me Matte Foundation (30ml)",
    costPrice: 420,
    sellingPrice: 549,
    stock: 8,
    lowStockThreshold: 3,
    category: "Cosmetics",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p8",
    name: "Nivea Soft Light Moisturizer (100ml)",
    costPrice: 160,
    sellingPrice: 210,
    stock: 2, // Low stock demo (< 4)
    lowStockThreshold: 4,
    category: "Cosmetics",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p9",
    name: "Pond's Bright Beauty Face Wash (100g)",
    costPrice: 95,
    sellingPrice: 135,
    stock: 18,
    lowStockThreshold: 5,
    category: "Cosmetics",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function ensureLocalFile(): LocalStoreData {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE_PATH)) {
      const initial: LocalStoreData = {
        products: INITIAL_PRODUCTS,
        sales: [],
      };
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE_PATH, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Local file read error:", err);
    return { products: INITIAL_PRODUCTS, sales: [] };
  }
}

function saveLocalData(data: LocalStoreData) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Local file write error:", err);
  }
}

let isNeonConnected = false;
let checkDone = false;

async function checkDatabaseConnection(): Promise<boolean> {
  if (checkDone) return isNeonConnected;
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("dummy")) {
    isNeonConnected = false;
    checkDone = true;
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    isNeonConnected = true;
  } catch {
    isNeonConnected = false;
  }
  checkDone = true;
  return isNeonConnected;
}

export const storeService = {
  // 1. Get all products
  async getProducts(): Promise<ProductItem[]> {
    const usePrisma = await checkDatabaseConnection();
    if (usePrisma) {
      const records = await prisma.product.findMany({
        orderBy: { name: "asc" },
      });
      return records.map((p: any) => ({
        id: p.id,
        name: p.name,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        category: p.category || "General",
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));
    }

    const data = ensureLocalFile();
    return data.products.sort((a, b) => a.name.localeCompare(b.name));
  },

  // 2. Add product
  async addProduct(input: {
    name: string;
    costPrice: number;
    sellingPrice: number;
    stock: number;
    lowStockThreshold?: number;
    category?: string;
  }): Promise<ProductItem> {
    const usePrisma = await checkDatabaseConnection();
    if (usePrisma) {
      const p = await prisma.product.create({
        data: {
          name: input.name.trim(),
          costPrice: Number(input.costPrice),
          sellingPrice: Number(input.sellingPrice),
          stock: Number(input.stock),
          lowStockThreshold: input.lowStockThreshold ? Number(input.lowStockThreshold) : 3,
          category: input.category?.trim() || "General",
        },
      });
      return {
        id: p.id,
        name: p.name,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        category: p.category || "General",
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    }

    const data = ensureLocalFile();
    const newProduct: ProductItem = {
      id: "prod_" + Date.now() + Math.random().toString(36).substring(2, 6),
      name: input.name.trim(),
      costPrice: Number(input.costPrice) || 0,
      sellingPrice: Number(input.sellingPrice) || 0,
      stock: Number(input.stock) || 0,
      lowStockThreshold: Number(input.lowStockThreshold) || 3,
      category: input.category?.trim() || "General",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.products.push(newProduct);
    saveLocalData(data);
    return newProduct;
  },

  // 3. Update Product
  async updateProduct(
    id: string,
    input: Partial<{
      name: string;
      costPrice: number;
      sellingPrice: number;
      stock: number;
      lowStockThreshold: number;
      category: string;
    }>
  ): Promise<ProductItem | null> {
    const usePrisma = await checkDatabaseConnection();
    if (usePrisma) {
      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name.trim() }),
          ...(input.costPrice !== undefined && { costPrice: Number(input.costPrice) }),
          ...(input.sellingPrice !== undefined && { sellingPrice: Number(input.sellingPrice) }),
          ...(input.stock !== undefined && { stock: Number(input.stock) }),
          ...(input.lowStockThreshold !== undefined && {
            lowStockThreshold: Number(input.lowStockThreshold),
          }),
          ...(input.category && { category: input.category.trim() }),
        },
      });
      return {
        id: updated.id,
        name: updated.name,
        costPrice: updated.costPrice,
        sellingPrice: updated.sellingPrice,
        stock: updated.stock,
        lowStockThreshold: updated.lowStockThreshold,
        category: updated.category || "General",
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    }

    const data = ensureLocalFile();
    const idx = data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    data.products[idx] = {
      ...data.products[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    saveLocalData(data);
    return data.products[idx];
  },

  // 4. Quick stock change (+ or -)
  async adjustStock(id: string, delta: number): Promise<ProductItem | null> {
    const usePrisma = await checkDatabaseConnection();
    if (usePrisma) {
      const p = await prisma.product.update({
        where: { id },
        data: {
          stock: { increment: delta },
        },
      });
      return {
        id: p.id,
        name: p.name,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        category: p.category || "General",
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    }

    const data = ensureLocalFile();
    const prod = data.products.find((p) => p.id === id);
    if (!prod) return null;
    prod.stock = Math.max(0, prod.stock + delta);
    prod.updatedAt = new Date().toISOString();
    saveLocalData(data);
    return prod;
  },

  // 5. Delete product
  async deleteProduct(id: string): Promise<boolean> {
    const usePrisma = await checkDatabaseConnection();
    if (usePrisma) {
      await prisma.product.delete({ where: { id } });
      return true;
    }

    const data = ensureLocalFile();
    data.products = data.products.filter((p) => p.id !== id);
    saveLocalData(data);
    return true;
  },

  // 6. Record Sale (POS transaction)
  async createSale(input: {
    items: Array<{
      productId: string;
      quantity: number;
      unitCostPrice: number;
      unitSellingPrice: number;
      productName: string;
    }>;
    totalAmount: number; // Final amount paid by customer (after discount/edit)
    discount?: number;
    paymentMode: "CASH" | "ONLINE";
    notes?: string;
  }): Promise<SaleRecord> {
    let totalCost = 0;
    input.items.forEach((item) => {
      totalCost += item.unitCostPrice * item.quantity;
    });

    const finalAmount = Number(input.totalAmount);
    const profit = finalAmount - totalCost;
    const discount = Number(input.discount || 0);

    const usePrisma = await checkDatabaseConnection();
    if (usePrisma) {
      const createdSale = await prisma.$transaction(async (tx: any) => {
        // 1. Deduct stock for each product
        for (const it of input.items) {
          if (it.productId) {
            await tx.product.update({
              where: { id: it.productId },
              data: {
                stock: { decrement: it.quantity },
              },
            });
          }
        }

        // 2. Create Sale
        const sale = await tx.sale.create({
          data: {
            totalAmount: finalAmount,
            totalCost,
            profit,
            discount,
            paymentMode: input.paymentMode,
            notes: input.notes,
            items: {
              create: input.items.map((it) => ({
                productId: it.productId,
                productName: it.productName,
                quantity: it.quantity,
                unitCostPrice: it.unitCostPrice,
                unitSellingPrice: it.unitSellingPrice,
                subtotal: it.unitSellingPrice * it.quantity,
              })),
            },
          },
          include: {
            items: true,
          },
        });
        return sale;
      });

      return {
        id: createdSale.id,
        totalAmount: createdSale.totalAmount,
        totalCost: createdSale.totalCost,
        profit: createdSale.profit,
        discount: createdSale.discount,
        paymentMode: createdSale.paymentMode as "CASH" | "ONLINE",
        notes: createdSale.notes || undefined,
        createdAt: createdSale.createdAt.toISOString(),
        items: createdSale.items.map((it: any) => ({
          id: it.id,
          productId: it.productId || undefined,
          productName: it.productName,
          quantity: it.quantity,
          unitCostPrice: it.unitCostPrice,
          unitSellingPrice: it.unitSellingPrice,
          subtotal: it.subtotal,
        })),
      };
    }

    // Local file fallback
    const data = ensureLocalFile();
    // 1. Deduct stock
    for (const it of input.items) {
      const product = data.products.find((p) => p.id === it.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - it.quantity);
        product.updatedAt = new Date().toISOString();
      }
    }

    // 2. Create sale record
    const saleId = "sale_" + Date.now();
    const newSale: SaleRecord = {
      id: saleId,
      totalAmount: finalAmount,
      totalCost,
      profit,
      discount,
      paymentMode: input.paymentMode,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      items: input.items.map((it, idx) => ({
        id: "item_" + saleId + "_" + idx,
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitCostPrice: it.unitCostPrice,
        unitSellingPrice: it.unitSellingPrice,
        subtotal: it.unitSellingPrice * it.quantity,
      })),
    };

    data.sales.unshift(newSale);
    saveLocalData(data);
    return newSale;
  },

  // 7. Get sales history
  async getSales(filter?: "today" | "week" | "month" | "all"): Promise<SaleRecord[]> {
    const usePrisma = await checkDatabaseConnection();
    const now = new Date();
    let gteDate: Date | undefined;

    if (filter === "today") {
      gteDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filter === "week") {
      gteDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filter === "month") {
      gteDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (usePrisma) {
      const sales = await prisma.sale.findMany({
        where: gteDate ? { createdAt: { gte: gteDate } } : undefined,
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
      return sales.map((s: any) => ({
        id: s.id,
        totalAmount: s.totalAmount,
        totalCost: s.totalCost,
        profit: s.profit,
        discount: s.discount,
        paymentMode: s.paymentMode as "CASH" | "ONLINE",
        notes: s.notes || undefined,
        createdAt: s.createdAt.toISOString(),
        items: s.items.map((it: any) => ({
          id: it.id,
          productId: it.productId || undefined,
          productName: it.productName,
          quantity: it.quantity,
          unitCostPrice: it.unitCostPrice,
          unitSellingPrice: it.unitSellingPrice,
          subtotal: it.subtotal,
        })),
      }));
    }

    const data = ensureLocalFile();
    if (!gteDate) return data.sales;

    const limitTime = gteDate.getTime();
    return data.sales.filter((s) => new Date(s.createdAt).getTime() >= limitTime);
  },

  // 8. Analytics & Dashboard Statistics
  async getDashboardStats() {
    const products = await this.getProducts();
    const sales = await this.getSales("all");

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let todaySales = 0;
    let todayCash = 0;
    let todayOnline = 0;
    let todayProfit = 0;
    let todayCount = 0;

    let monthSales = 0;
    let monthProfit = 0;
    let monthCount = 0;

    // Last 7 days breakdown for weekly chart
    const daysMap: Record<string, { label: string; sales: number; profit: number; count: number }> =
      {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short" });
      daysMap[key] = { label: dayLabel, sales: 0, profit: 0, count: 0 };
    }

    sales.forEach((s) => {
      const saleTime = new Date(s.createdAt).getTime();
      const dateKey = s.createdAt.split("T")[0];

      // Weekly trend
      if (daysMap[dateKey]) {
        daysMap[dateKey].sales += s.totalAmount;
        daysMap[dateKey].profit += s.profit;
        daysMap[dateKey].count += 1;
      }

      // Today stats
      if (saleTime >= startOfToday) {
        todaySales += s.totalAmount;
        todayProfit += s.profit;
        todayCount += 1;
        if (s.paymentMode === "CASH") todayCash += s.totalAmount;
        if (s.paymentMode === "ONLINE") todayOnline += s.totalAmount;
      }

      // Month stats
      if (saleTime >= startOfMonth) {
        monthSales += s.totalAmount;
        monthProfit += s.profit;
        monthCount += 1;
      }
    });

    // Low stock items: items with stock <= lowStockThreshold
    const lowStockItems = products.filter((p) => p.stock <= p.lowStockThreshold);

    return {
      today: {
        total: todaySales,
        cash: todayCash,
        online: todayOnline,
        profit: todayProfit,
        count: todayCount,
      },
      month: {
        total: monthSales,
        profit: monthProfit,
        count: monthCount,
      },
      weeklyTrend: Object.entries(daysMap).map(([date, val]) => ({
        date,
        label: val.label,
        sales: val.sales,
        profit: val.profit,
        count: val.count,
      })),
      lowStockItems,
      totalProductsCount: products.length,
      recentSales: sales.slice(0, 8),
    };
  },
};

