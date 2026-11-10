const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '..', 'data', 'store_data.json');
  if (!fs.existsSync(filePath)) {
    console.log('No store_data.json found');
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  console.log(`Found ${data.products?.length || 0} products and ${data.sales?.length || 0} sales.`);

  // 1. Insert products
  for (const prod of (data.products || [])) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        costPrice: Number(prod.costPrice),
        sellingPrice: Number(prod.sellingPrice),
        stock: Number(prod.stock),
        lowStockThreshold: Number(prod.lowStockThreshold || 3),
        category: prod.category || 'General',
        updatedAt: new Date(prod.updatedAt || Date.now())
      },
      create: {
        id: prod.id,
        name: prod.name,
        costPrice: Number(prod.costPrice),
        sellingPrice: Number(prod.sellingPrice),
        stock: Number(prod.stock),
        lowStockThreshold: Number(prod.lowStockThreshold || 3),
        category: prod.category || 'General',
        createdAt: new Date(prod.createdAt || Date.now()),
        updatedAt: new Date(prod.updatedAt || Date.now())
      }
    });
  }
  console.log('Products successfully migrated to Neon DB!');

  // 2. Insert sales
  for (const sale of (data.sales || [])) {
    const existing = await prisma.sale.findUnique({ where: { id: sale.id } });
    if (!existing) {
      await prisma.sale.create({
        data: {
          id: sale.id,
          totalAmount: Number(sale.totalAmount),
          totalCost: Number(sale.totalCost),
          profit: Number(sale.profit),
          discount: Number(sale.discount || 0),
          paymentMode: sale.paymentMode || 'CASH',
          notes: sale.notes || null,
          createdAt: new Date(sale.createdAt || Date.now()),
          items: {
            create: (sale.items || []).map((it) => ({
              productId: it.productId || null,
              productName: it.productName,
              quantity: Number(it.quantity),
              unitCostPrice: Number(it.unitCostPrice),
              unitSellingPrice: Number(it.unitSellingPrice),
              subtotal: Number(it.subtotal)
            }))
          }
        }
      });
    }
  }
  console.log('Sales successfully migrated to Neon DB!');
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

