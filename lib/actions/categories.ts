'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';
import type { CategoryInput } from '@/lib/validations';

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createCategory(data: CategoryInput) {
  await requireAdmin();
  const validated = categorySchema.parse(data);

  const category = await prisma.category.create({
    data: validated,
  });

  revalidatePath('/categories');
  return { success: true, category };
}

export async function updateCategory(id: string, data: CategoryInput) {
  await requireAdmin();
  const validated = categorySchema.parse(data);

  const category = await prisma.category.update({
    where: { id },
    data: validated,
  });

  revalidatePath('/categories');
  return { success: true, category };
}

export async function deactivateCategory(id: string) {
  await requireAdmin();

  await prisma.category.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath('/categories');
  return { success: true };
}

export async function toggleCategoryStatus(id: string, isActive: boolean) {
  await requireAdmin();

  await prisma.category.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath('/categories');
  return { success: true };
}
