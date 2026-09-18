'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save, ShoppingBag } from 'lucide-react';
import { createPurchase } from '@/lib/actions/purchases';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SupplierOption {
  id: string;
  name: string;
  companyName: string | null;
}

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  purchasePrice: number | string | any;
  unit: string;
}

interface CreatePurchaseFormProps {
  suppliers: SupplierOption[];
  products: ProductOption[];
}

interface ItemRow {
  productId: string;
  quantity: number;
  purchasePrice: number;
  taxPercent: number;
}

export function CreatePurchaseForm({ suppliers, products }: CreatePurchaseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<ItemRow[]>([
    { productId: products[0]?.id || '', quantity: 1, purchasePrice: Number(products[0]?.purchasePrice) || 0, taxPercent: 0 }
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const handleAddItem = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    setItems([
      ...items,
      { productId: firstProd.id, quantity: 1, purchasePrice: Number(firstProd.purchasePrice) || 0, taxPercent: 0 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, pId: string) => {
    const prod = products.find(p => p.id === pId);
    const updated = [...items];
    updated[index].productId = pId;
    if (prod) {
      updated[index].purchasePrice = Number(prod.purchasePrice) || 0;
    }
    setItems(updated);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast({ title: 'Supplier Required', description: 'Please select a supplier', variant: 'destructive' });
      return;
    }
    if (items.length === 0) {
      toast({ title: 'Items Required', description: 'Please add at least one product item', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      try {
        const res = await createPurchase({
          supplierId,
          referenceNumber,
          purchaseDate,
          items,
          discount,
          notes,
          paymentStatus: 'PAID',
          status: 'RECEIVED',
        });

        if (res.success) {
          toast({ title: 'Purchase Created', description: 'Stock levels updated automatically!' });
          router.push('/purchases');
          router.refresh();
        } else {
          toast({ title: 'Failed to Create', description: (res as any).error || 'Failed to create purchase', variant: 'destructive' });
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'An error occurred', variant: 'destructive' });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/purchases"
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Record Stock Purchase Order</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Adding items here updates your current stock levels and inventory cost valuation automatically.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        {/* Supplier & Ref Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.companyName ? `(${s.companyName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Supplier Invoice / Ref No.
            </label>
            <input
              type="text"
              placeholder="e.g. PO-89231"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Purchase Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Purchase Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Ordered Products</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-medium rounded-lg text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>

          <div className="space-y-3">
            {items.map((row, idx) => {
              const rowTotal = row.quantity * row.purchasePrice;
              return (
                <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
                  <div className="col-span-5">
                    <label className="block text-xs text-slate-500 mb-1">Product</label>
                    <select
                      value={row.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].quantity = parseInt(e.target.value) || 1;
                        setItems(updated);
                      }}
                      className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-xs text-slate-500 mb-1">Unit Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.purchasePrice}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].purchasePrice = parseFloat(e.target.value) || 0;
                        setItems(updated);
                      }}
                      className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-between pt-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(rowTotal)}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 max-w-sm ml-auto text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">Discount (₹):</span>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-28 px-2 py-1 text-right text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded"
            />
          </div>

          <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
            <span>Grand Total:</span>
            <span className="text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Order Notes / Delivery Details
          </label>
          <textarea
            rows={2}
            placeholder="Optional order notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/purchases"
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'Saving...' : 'Save & Receive Purchase Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
