'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { purchaseSchema } from '@/lib/validations';
import type { PurchaseInput } from '@/lib/validations';
import { roundDecimal } from '@/lib/utils';
import { Decimal } from '@prisma/client/runtime/library';
import { StockTransactionType, PurchaseStatus } from '@prisma/client';

export async function createPurchase(data: PurchaseInput) {
  const user = await requireAdmin();
  const validated = purchaseSchema.parse(data);

  // Fetch products
  const productIds = validated.items.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  // Calculate totals server-side
  let subtotal = 0;
  let totalTax = 0;

  const calculatedItems = validated.items.map(item => {
    const qty = item.quantity;
    const price = item.purchasePrice;
    const itemSubtotal = roundDecimal(qty * price);
    const taxPercent = item.taxPercent;
    const taxAmount = roundDecimal((itemSubtotal * taxPercent) / 100);
    const itemTotal = roundDecimal(itemSubtotal + taxAmount);

    subtotal += itemSubtotal;
    totalTax += taxAmount;

    return {
      productId: item.productId,
      quantity: qty,
      purchasePrice: price,
      tax: taxAmount,
      total: itemTotal,
    };
  });

  subtotal = roundDecimal(subtotal);
  totalTax = roundDecimal(totalTax);
  const discount = roundDecimal(validated.discount);
  const grandTotal = roundDecimal(subtotal + totalTax - discount);
  const isReceived = validated.status === 'RECEIVED';

  const result = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        supplierId: validated.supplierId,
        userId: user.id,
        referenceNumber: validated.referenceNumber,
        purchaseDate: new Date(validated.purchaseDate),
        subtotal: new Decimal(subtotal),
        tax: new Decimal(totalTax),
        discount: new Decimal(discount),
        total: new Decimal(grandTotal),
        paymentStatus: validated.paymentStatus as any,
        status: validated.status as any,
        notes: validated.notes,
        items: {
          create: calculatedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            purchasePrice: new Decimal(item.purchasePrice),
            tax: new Decimal(item.tax),
            total: new Decimal(item.total),
          })),
        },
      },
    });

    // If received, update stock
    if (isReceived) {
      for (const item of calculatedItems) {
        const product = productMap.get(item.productId);
        if (!product) throw new Error(`Product not found: ${item.productId}`);

        const newStock = product.currentStock + item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: newStock,
            // Update purchase price to reflect latest cost
            purchasePrice: new Decimal(item.purchasePrice),
          },
        });

        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            userId: user.id,
            type: StockTransactionType.PURCHASE,
            quantity: item.quantity,
            balanceAfter: newStock,
            reason: `Purchase from supplier - Ref: ${validated.referenceNumber || purchase.id}`,
            referenceId: purchase.id,
            referenceType: 'Purchase',
          },
        });
      }
    }

    return purchase;
  });

  revalidatePath('/purchases');
  revalidatePath('/inventory');
  revalidatePath('/dashboard');
  return { success: true, purchaseId: result.id };
}

export async function receivePurchase(purchaseId: string) {
  const user = await requireAdmin();

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { items: { include: { product: true } } },
  });

  if (!purchase) throw new Error('Purchase not found');
  if (purchase.status === PurchaseStatus.RECEIVED) throw new Error('Purchase already received');

  await prisma.$transaction(async (tx) => {
    await tx.purchase.update({
      where: { id: purchaseId },
      data: { status: PurchaseStatus.RECEIVED },
    });

    for (const item of purchase.items) {
      const newStock = item.product.currentStock + item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: newStock, purchasePrice: item.purchasePrice },
      });

      await tx.stockTransaction.create({
        data: {
          productId: item.productId,
          userId: user.id,
          type: StockTransactionType.PURCHASE,
          quantity: item.quantity,
          balanceAfter: newStock,
          reason: `Purchase received - Ref: ${purchase.referenceNumber || purchase.id}`,
          referenceId: purchase.id,
          referenceType: 'Purchase',
        },
      });
    }
  });

  revalidatePath('/purchases');
  revalidatePath(`/purchases/${purchaseId}`);
  revalidatePath('/inventory');
  return { success: true };
}

export async function getPurchases(params?: {
  search?: string;
  supplierId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const { search, supplierId, status, from, to, page = 1, limit = 20 } = params ?? {};

  const where: any = {};

  if (search) {
    where.OR = [
      { referenceNumber: { contains: search, mode: 'insensitive' } },
      { supplier: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (supplierId) where.supplierId = supplierId;
  if (status) where.status = status;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [purchases, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      include: {
        supplier: { select: { name: true, companyName: true } },
        user: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchase.count({ where }),
  ]);

  return { purchases, total, pages: Math.ceil(total / limit) };
}

export async function getPurchaseById(id: string) {
  return prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      user: { select: { name: true } },
      items: {
        include: { product: { select: { name: true, sku: true, unit: true } } },
      },
    },
  });
}
