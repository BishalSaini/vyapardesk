'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireUser } from '@/lib/auth';
import { productSchema } from '@/lib/validations';
import type { ProductInput } from '@/lib/validations';

export async function getProducts(params?: {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}) {
  const { search, categoryId, isActive = true, lowStock, page = 1, limit = 20 } = params ?? {};

  const where: any = { isActive };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (lowStock) {
    const allMatching = await prisma.product.findMany({
      where,
      include: { category: true, supplier: true },
      orderBy: { name: 'asc' },
    });
    const filtered = allMatching.filter((p) => p.currentStock <= p.minStockLevel);
    const total = filtered.length;
    const products = filtered.slice((page - 1) * limit, page * limit);
    return { products, total, pages: Math.ceil(total / limit) };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, supplier: true },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, pages: Math.ceil(total / limit) };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
      stockTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      saleItems: {
        include: { sale: { select: { invoiceNumber: true, createdAt: true, status: true } } },
        orderBy: { sale: { createdAt: 'desc' } },
        take: 10,
      },
      purchaseItems: {
        include: { purchase: { select: { id: true, referenceNumber: true, createdAt: true } } },
        orderBy: { purchase: { createdAt: 'desc' } },
        take: 10,
      },
    },
  });
}

export async function createProduct(data: ProductInput) {
  await requireAdmin();
  const validated = productSchema.parse(data);

  const product = await prisma.product.create({
    data: {
      name: validated.name,
      sku: validated.sku,
      barcode: validated.barcode || null,
      categoryId: validated.categoryId,
      supplierId: validated.supplierId || null,
      purchasePrice: validated.purchasePrice,
      sellingPrice: validated.sellingPrice,
      taxPercent: validated.taxPercent,
      currentStock: validated.currentStock,
      minStockLevel: validated.minStockLevel,
      unit: validated.unit as any,
      description: validated.description,
    },
  });

  revalidatePath('/products');
  revalidatePath('/inventory');
  return { success: true, product };
}

export async function updateProduct(id: string, data: ProductInput) {
  await requireAdmin();
  const validated = productSchema.parse(data);

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: validated.name,
      sku: validated.sku,
      barcode: validated.barcode || null,
      categoryId: validated.categoryId,
      supplierId: validated.supplierId || null,
      purchasePrice: validated.purchasePrice,
      sellingPrice: validated.sellingPrice,
      taxPercent: validated.taxPercent,
      minStockLevel: validated.minStockLevel,
      unit: validated.unit as any,
      description: validated.description,
    },
  });

  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  revalidatePath('/inventory');
  return { success: true, product };
}

export async function deactivateProduct(id: string) {
  await requireAdmin();

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath('/products');
  return { success: true };
}

export async function searchProductsForBilling(query: string) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      currentStock: { gt: 0 },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { barcode: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: { category: true },
    take: 10,
    orderBy: { name: 'asc' },
  });

  return products;
}

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { currentStock: 'asc' },
  });
  return products.filter((p) => p.currentStock <= p.minStockLevel).slice(0, 10);
}
