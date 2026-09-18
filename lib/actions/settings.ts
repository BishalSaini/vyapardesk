'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { shopSettingsSchema } from '@/lib/validations';
import type { ShopSettingsInput } from '@/lib/validations';

export async function getShopSettings() {
  const settings = await prisma.shopSettings.findFirst();
  return settings;
}

export async function updateShopSettings(data: ShopSettingsInput) {
  await requireAdmin();
  const validated = shopSettingsSchema.parse(data);

  const existing = await prisma.shopSettings.findFirst();

  if (existing) {
    await prisma.shopSettings.update({
      where: { id: existing.id },
      data: validated,
    });
  } else {
    await prisma.shopSettings.create({
      data: { id: 'default', ...validated },
    });
  }

  revalidatePath('/settings');
  revalidatePath('/billing');
  return { success: true };
}
