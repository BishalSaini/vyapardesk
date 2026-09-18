'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { supplierSchema } from '@/lib/validations';
import type { SupplierInput } from '@/lib/validations';

export async function getSuppliers(params?: { search?: string; page?: number; limit?: number }) {
  const { search, page = 1, limit = 20 } = params ?? {};

  const where: any = { isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: { _count: { select: { products: true, purchases: true } } },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supplier.count({ where }),
  ]);

  return { suppliers, total, pages: Math.ceil(total / limit) };
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      purchases: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      products: {
        where: { isActive: true },
        take: 20,
      },
    },
  });
}

export async function createSupplier(data: SupplierInput) {
  await requireAdmin();
  const validated = supplierSchema.parse(data);

  const supplier = await prisma.supplier.create({ data: validated });
  revalidatePath('/suppliers');
  return { success: true, supplier };
}

export async function updateSupplier(id: string, data: SupplierInput) {
  await requireAdmin();
  const validated = supplierSchema.parse(data);

  const supplier = await prisma.supplier.update({ where: { id }, data: validated });
  revalidatePath('/suppliers');
  revalidatePath(`/suppliers/${id}`);
  return { success: true, supplier };
}

export async function deactivateSupplier(id: string) {
  await requireAdmin();
  await prisma.supplier.update({ where: { id }, data: { isActive: false } });
  revalidatePath('/suppliers');
  return { success: true };
}
