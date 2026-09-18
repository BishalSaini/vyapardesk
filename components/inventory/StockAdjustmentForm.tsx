'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { adjustStock } from '@/lib/actions/inventory';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  unit: string;
}

interface StockAdjustmentFormProps {
  products: ProductOption[];
}

export function StockAdjustmentForm({ products }: StockAdjustmentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [qty, setQty] = useState<number>(1);
  const [reason, setReason] = useState<string>('');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    if (qty <= 0) {
      toast({ title: 'Invalid Quantity', description: 'Quantity must be greater than 0', variant: 'destructive' });
      return;
    }
    if (reason.trim().length < 5) {
      toast({ title: 'Reason Required', description: 'Please enter a clear reason (at least 5 characters)', variant: 'destructive' });
      return;
    }

    const finalQuantity = adjustmentType === 'ADD' ? qty : -qty;

    startTransition(async () => {
      try {
        const res = await adjustStock({
          productId: selectedProductId,
          quantity: finalQuantity,
          reason,
        });

        if (res.success) {
          toast({ title: 'Stock Adjusted', description: `Successfully adjusted stock for ${selectedProduct?.name}` });
          router.push('/inventory');
          router.refresh();
        } else {
          toast({ title: 'Adjustment Failed', description: (res as any).error || 'Failed to adjust stock', variant: 'destructive' });
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to adjust stock', variant: 'destructive' });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/inventory"
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Manual Stock Adjustment</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Correct stock count for damages, lost items, returned goods, or inventory audits.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Select Product <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (SKU: {p.sku}) — Current Stock: {p.currentStock} {p.unit}
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
            <span>Product: <strong>{selectedProduct.name}</strong></span>
            <span>Current Balance: <strong>{selectedProduct.currentStock} {selectedProduct.unit}</strong></span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Adjustment Type <span className="text-red-500">*</span>
            </label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as 'ADD' | 'REMOVE')}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ADD">➕ Add Stock (Adjustment IN)</option>
              <option value="REMOVE">➖ Reduce Stock (Adjustment OUT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Quantity ({selectedProduct?.unit || 'Units'}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Reason / Audit Explanation <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="e.g. Damaged goods discarded during shelf cleanup, physical count audit discrepancy..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/inventory"
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            {isPending ? <LoadingSpinner /> : <Save className="w-4 h-4" />}
            {isPending ? 'Adjusting...' : 'Save Adjustment'}
          </button>
        </div>
      </form>
    </div>
  );
}
