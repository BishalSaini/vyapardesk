'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireUser, requireAdmin } from '@/lib/auth';
import { saleSchema } from '@/lib/validations';
import type { SaleInput } from '@/lib/validations';
import { generateInvoiceNumber } from '@/lib/services/invoice';
import { roundDecimal } from '@/lib/utils';
import { Decimal } from '@prisma/client/runtime/library';
import { StockTransactionType, PaymentStatus, SaleStatus } from '@prisma/client';

export async function completeSale(data: SaleInput) {
  const user = await requireUser();
  const validated = saleSchema.parse(data);

  if (validated.paymentMethod === 'CREDIT' && !validated.customerId) {
    throw new Error('Customer is required for credit sales');
  }

  // Fetch all products in cart for validation
  const productIds = validated.items.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  const productMap = new Map(products.map(p => [p.id, p]));

  // Validate stock
  for (const item of validated.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }
    if (product.currentStock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.currentStock}, Requested: ${item.quantity}`);
    }
  }

  // Recalculate totals SERVER-SIDE
  let subtotal = 0;
  let totalTax = 0;

  const calculatedItems = validated.items.map(item => {
    const product = productMap.get(item.productId)!;
    const qty = item.quantity;
    const unitPrice = parseFloat(product.sellingPrice.toString()); // Use DB price, not client price
    const itemSubtotal = roundDecimal(qty * unitPrice);
    const itemDiscount = roundDecimal(Math.min(item.discount, itemSubtotal));
    const taxableAmount = roundDecimal(itemSubtotal - itemDiscount);
    const taxPercent = parseFloat(product.taxPercent.toString());
    const taxAmount = roundDecimal((taxableAmount * taxPercent) / 100);
    const itemTotal = roundDecimal(taxableAmount + taxAmount);

    subtotal += itemSubtotal;
    totalTax += taxAmount;

    return {
      productId: item.productId,
      quantity: qty,
      unitPrice,
      discount: itemDiscount,
      tax: taxAmount,
      total: itemTotal,
    };
  });

  subtotal = roundDecimal(subtotal);
  const overallDiscount = roundDecimal(Math.min(validated.discount, subtotal));
  totalTax = roundDecimal(totalTax);
  const grandTotal = roundDecimal(subtotal - overallDiscount + totalTax);

  // Determine payment status
  let paymentStatus: PaymentStatus;
  let paidAmount = grandTotal;

  if (validated.paymentMethod === 'CREDIT') {
    paymentStatus = PaymentStatus.UNPAID;
    paidAmount = 0;
  } else {
    paymentStatus = PaymentStatus.PAID;
    paidAmount = grandTotal;
  }

  // Execute the complete sale in a single transaction
  const result = await prisma.$transaction(async (tx) => {
    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(tx as any);

    // Create the sale
    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        customerId: validated.customerId || null,
        userId: user.id,
        subtotal: new Decimal(subtotal),
        discount: new Decimal(overallDiscount),
        tax: new Decimal(totalTax),
        total: new Decimal(grandTotal),
        paymentStatus,
        status: SaleStatus.COMPLETED,
        notes: validated.notes,
        items: {
          create: calculatedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
            discount: new Decimal(item.discount),
            tax: new Decimal(item.tax),
            total: new Decimal(item.total),
          })),
        },
      },
    });

    // Create payment record
    await tx.payment.create({
      data: {
        saleId: sale.id,
        customerId: validated.customerId || null,
        amount: new Decimal(paidAmount),
        method: validated.paymentMethod as any,
        notes: validated.paymentMethod === 'CASH' && validated.amountReceived
          ? `Cash received: ₹${validated.amountReceived}, Change: ₹${roundDecimal((validated.amountReceived ?? grandTotal) - grandTotal)}`
          : '',
      },
    });

    // Update stock and create stock transactions
    for (const item of calculatedItems) {
      const product = productMap.get(item.productId)!;
      const newStock = product.currentStock - item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: newStock },
      });

      await tx.stockTransaction.create({
        data: {
          productId: item.productId,
          userId: user.id,
          type: StockTransactionType.SALE,
          quantity: item.quantity,
          balanceAfter: newStock,
          reason: `Sale - ${invoiceNumber}`,
          referenceId: sale.id,
          referenceType: 'Sale',
        },
      });
    }

    // Update customer outstanding balance if credit sale
    if (validated.paymentMethod === 'CREDIT' && validated.customerId) {
      await tx.customer.update({
        where: { id: validated.customerId },
        data: {
          outstandingAmount: { increment: new Decimal(grandTotal) },
        },
      });
    }

    return sale;
  });

  revalidatePath('/dashboard');
  revalidatePath('/sales');
  revalidatePath('/inventory');
  revalidatePath('/billing');

  return { success: true, saleId: result.id, invoiceNumber: result.invoiceNumber };
}

export async function getSales(params?: {
  search?: string;
  customerId?: string;
  paymentStatus?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const { search, customerId, paymentStatus, status, from, to, page = 1, limit = 20 } = params ?? {};

  const where: any = {};

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (customerId) where.customerId = customerId;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (status) where.status = status;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        customer: { select: { name: true, phone: true } },
        user: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sale.count({ where }),
  ]);

  return { sales, total, pages: Math.ceil(total / limit) };
}

export async function getSaleById(id: string) {
  return prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: {
            select: { name: true, sku: true, unit: true, taxPercent: true },
          },
        },
      },
      payments: true,
    },
  });
}

export async function cancelSale(id: string, reason: string) {
  await requireAdmin();

  if (!reason || reason.trim().length < 5) {
    throw new Error('Please provide a valid reason for cancellation (minimum 5 characters)');
  }

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });

  if (!sale) throw new Error('Sale not found');
  if (sale.status === SaleStatus.CANCELLED) throw new Error('Sale is already cancelled');

  const user = await requireAdmin();

  await prisma.$transaction(async (tx) => {
    // Mark sale as cancelled
    await tx.sale.update({
      where: { id },
      data: {
        status: SaleStatus.CANCELLED,
        cancelReason: reason,
        cancelledAt: new Date(),
        cancelledBy: user.id,
      },
    });

    // Restore stock
    for (const item of sale.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (product) {
        const newStock = product.currentStock + item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: newStock },
        });

        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            userId: user.id,
            type: StockTransactionType.SALE_RETURN,
            quantity: item.quantity,
            balanceAfter: newStock,
            reason: `Sale Cancelled - ${sale.invoiceNumber}: ${reason}`,
            referenceId: id,
            referenceType: 'SaleReturn',
          },
        });
      }
    }

    // Reverse customer outstanding if credit sale
    if (sale.customerId && sale.paymentStatus === PaymentStatus.UNPAID) {
      await tx.customer.update({
        where: { id: sale.customerId },
        data: {
          outstandingAmount: { decrement: sale.total },
        },
      });
    }
  });

  revalidatePath('/sales');
  revalidatePath(`/sales/${id}`);
  revalidatePath('/dashboard');
  revalidatePath('/inventory');
  return { success: true };
}
