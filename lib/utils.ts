
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deep-serialize Prisma objects for passing to Client Components.
 * Converts Decimal → number, Date → ISO string, and strips class prototypes.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_key, value) => {
    // Prisma Decimal has a toNumber() method
    if (value !== null && typeof value === 'object' && typeof value.toNumber === 'function') {
      return value.toNumber();
    }
    return value;
  }));
}

export function formatCurrency(amount: number | string | { toString(): string }): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy, hh:mm a');
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM/yyyy');
}

export function getStockStatus(currentStock: number, minStockLevel: number): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' {
  if (currentStock === 0) return 'OUT_OF_STOCK';
  if (currentStock <= minStockLevel) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export function generateSKU(productName: string): string {
  const words = productName.split(' ').filter(Boolean);
  const prefix = words.slice(0, 2).map(w => w.slice(0, 3).toUpperCase()).join('-');
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${suffix}`;
}

export function roundDecimal(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function calculateItemTotal(
  quantity: number,
  unitPrice: number,
  discount: number = 0,
  taxPercent: number = 0
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = roundDecimal(quantity * unitPrice);
  const discountedSubtotal = roundDecimal(subtotal - discount);
  const taxAmount = roundDecimal((discountedSubtotal * taxPercent) / 100);
  const total = roundDecimal(discountedSubtotal + taxAmount);
  return { subtotal, taxAmount, total };
}

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str;
}
