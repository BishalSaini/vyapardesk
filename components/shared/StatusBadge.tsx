import { cn } from '@/lib/utils';

type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';
type SaleStatus = 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
type PurchaseStatus = 'RECEIVED' | 'PENDING' | 'PARTIAL' | 'CANCELLED';
type UserRole = 'ADMIN' | 'CASHIER';

type BadgeVariant =
  | StockStatus
  | PaymentStatus
  | SaleStatus
  | PurchaseStatus
  | UserRole
  | 'ACTIVE'
  | 'INACTIVE';

const variantStyles: Record<BadgeVariant, string> = {
  IN_STOCK: 'bg-green-100 text-green-700',
  LOW_STOCK: 'bg-amber-100 text-amber-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
  PAID: 'bg-green-100 text-green-700',
  PARTIAL: 'bg-amber-100 text-amber-700',
  UNPAID: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
  RECEIVED: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  CASHIER: 'bg-slate-100 text-slate-700',
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-slate-100 text-slate-500',
};

const labelMap: Partial<Record<BadgeVariant, string>> = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
  PAID: 'Paid',
  PARTIAL: 'Partial',
  UNPAID: 'Unpaid',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
  RECEIVED: 'Received',
  PENDING: 'Pending',
  ADMIN: 'Admin',
  CASHIER: 'Cashier',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

interface StatusBadgeProps {
  status: BadgeVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[status] ?? 'bg-slate-100 text-slate-600',
        className
      )}
    >
      {labelMap[status] ?? status}
    </span>
  );
}

export function getStockStatusBadge(currentStock: number, minStockLevel: number) {
  if (currentStock === 0) return 'OUT_OF_STOCK' as const;
  if (currentStock <= minStockLevel) return 'LOW_STOCK' as const;
  return 'IN_STOCK' as const;
}
