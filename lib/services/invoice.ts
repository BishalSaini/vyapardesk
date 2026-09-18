import { prisma } from '@/lib/prisma';

/**
 * Generates a unique invoice number atomically.
 * Format: INV-2026-000001
 * Must be called within a Prisma transaction to ensure uniqueness.
 */
export async function generateInvoiceNumber(tx?: typeof prisma): Promise<string> {
  const db = tx ?? prisma;
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  // Get settings for custom prefix
  const settings = await db.shopSettings.findFirst();
  const invoicePrefix = settings?.invoicePrefix ?? 'INV';
  const fullPrefix = `${invoicePrefix}-${year}-`;

  // Find the last invoice this year
  const lastSale = await db.sale.findFirst({
    where: {
      invoiceNumber: {
        startsWith: fullPrefix,
      },
    },
    orderBy: {
      invoiceNumber: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastSale) {
    const lastNumber = parseInt(lastSale.invoiceNumber.replace(fullPrefix, ''), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${fullPrefix}${String(nextNumber).padStart(6, '0')}`;
}
