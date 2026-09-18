'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { stockAdjustmentSchema } from '@/lib/validations';
import type { StockAdjustmentInput } from '@/lib/validations';
import { StockTransactionType } from '@prisma/client';

export async function getInventory(params?: { search?: string; status?: string; page?: number; limit?: number }) {
  const { search, status, page = 1, limit = 20 } = params ?? {};

  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      supplier: true,
      stockTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.product.count({ where });

  let filtered = products;
  if (status === 'OUT_OF_STOCK') {
    filtered = products.filter(p => p.currentStock === 0);
  } else if (status === 'LOW_STOCK') {
    filtered = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel);
  } else if (status === 'IN_STOCK') {
    filtered = products.filter(p => p.currentStock > p.minStockLevel);
  }

  return { products: filtered, total, pages: Math.ceil(total / limit) };
}

export async function getInventoryStockLevels() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: { select: { name: true } },
      supplier: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function adjustStock(data: StockAdjustmentInput) {
  await requireAdmin();
  const validated = stockAdjustmentSchema.parse(data);

  const product = await prisma.product.findUnique({
    where: { id: validated.productId },
  });

  if (!product) throw new Error('Product not found');

  const newStock = product.currentStock + validated.quantity;
  if (newStock < 0) {
    throw new Error(`Cannot reduce stock below 0. Current stock is ${product.currentStock}`);
  }

  const type = validated.quantity > 0 ? StockTransactionType.ADJUSTMENT_IN : StockTransactionType.ADJUSTMENT_OUT;

  await prisma.$transaction([
    prisma.product.update({
      where: { id: validated.productId },
      data: { currentStock: newStock },
    }),
    prisma.stockTransaction.create({
      data: {
        productId: validated.productId,
        type,
        quantity: Math.abs(validated.quantity),
        balanceAfter: newStock,
        reason: validated.reason,
      },
    }),
  ]);

  revalidatePath('/inventory');
  revalidatePath(`/products/${validated.productId}`);
  return { success: true, newStock };
}

export async function getStockTransactions(params?: {
  productId?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  const { productId, type, page = 1, limit = 30 } = params ?? {};

  const where: any = {};
  if (productId) where.productId = productId;
  if (type) where.type = type;

  const transactions = await prisma.stockTransaction.findMany({
    where,
    include: {
      product: { select: { name: true, sku: true, unit: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return transactions;
}
