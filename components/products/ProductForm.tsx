'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { createProduct, updateProduct } from '@/lib/actions/products';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CategoryOption {
  id: string;
  name: string;
}

interface SupplierOption {
  id: string;
  name: string;
  companyName: string | null;
}

interface ProductFormProps {
  initialData?: {
    id: string;
    name: string;
    sku: string;
    barcode: string | null;
    categoryId: string;
    supplierId: string | null;
    purchasePrice: number | string | any;
    sellingPrice: number | string | any;
    taxPercent: number | string | any;
    currentStock: number;
    minStockLevel: number;
    unit: string;
    description: string | null;
  };
  categories: CategoryOption[];
  suppliers: SupplierOption[];
}

export function ProductForm({ initialData, categories, suppliers }: ProductFormProps) {
  const isEditing = !!initialData;
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    barcode: initialData?.barcode || '',
    categoryId: initialData?.categoryId || (categories[0]?.id || ''),
    supplierId: initialData?.supplierId || '',
    purchasePrice: initialData?.purchasePrice ? Number(initialData.purchasePrice) : 0,
    sellingPrice: initialData?.sellingPrice ? Number(initialData.sellingPrice) : 0,
    taxPercent: initialData?.taxPercent ? Number(initialData.taxPercent) : 0,
    currentStock: initialData?.currentStock ?? 0,
    minStockLevel: initialData?.minStockLevel ?? 5,
    unit: initialData?.unit || 'PIECE',
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.sku.trim()) errs.sku = 'SKU is required';
    if (!formData.categoryId) errs.categoryId = 'Category is required';
    if (formData.sellingPrice < formData.purchasePrice) {
      errs.sellingPrice = 'Selling price should be at least equal to purchase price';
    }
    if (formData.sellingPrice <= 0) errs.sellingPrice = 'Selling price must be greater than 0';
    if (formData.purchasePrice < 0) errs.purchasePrice = 'Purchase price cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      try {
        const payload = {
          ...formData,
          supplierId: formData.supplierId || null,
          barcode: formData.barcode || null,
          unit: formData.unit as any,
        };

        if (isEditing && initialData) {
          const res = await updateProduct(initialData.id, payload);
          if (res.success) {
            toast({ title: 'Success', description: 'Product updated successfully' });
            router.push('/products');
            router.refresh();
          } else {
            toast({ title: 'Error', description: (res as any).error || 'Failed to save product', variant: 'destructive' });
          }
        } else {
          const res = await createProduct(payload);
          if (res.success) {
            toast({ title: 'Success', description: 'Product created successfully' });
            router.push('/products');
            router.refresh();
          } else {
            toast({ title: 'Error', description: (res as any).error || 'Failed to save product', variant: 'destructive' });
          }
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'An error occurred', variant: 'destructive' });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {isEditing ? `Edit Product: ${initialData.name}` : 'Add New Product'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isEditing ? 'Update product pricing, stock limits, and details.' : 'Create a new inventory item.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        {/* Basic Info Section */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Parle-G Gold Biscuit 250g"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PG-250G"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono"
              />
              {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Barcode (Optional for POS scanner)
              </label>
              <input
                type="text"
                placeholder="e.g. 8901063012345"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Preferred Supplier
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">None / Multiple Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} {s.companyName ? `(${s.companyName})` : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Tax Section */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Pricing & GST Tax
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Cost / Purchase Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.purchasePrice === 0 ? '' : formData.purchasePrice}
                placeholder="0"
                onFocus={(e) => e.target.select()}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.sellingPrice === 0 ? '' : formData.sellingPrice}
                placeholder="0"
                onFocus={(e) => e.target.select()}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.sellingPrice && <p className="text-xs text-red-500 mt-1">{errors.sellingPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                GST Tax Rate (%)
              </label>
              <select
                value={formData.taxPercent}
                onChange={(e) => setFormData({ ...formData, taxPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={0}>0% (Exempt / Nil)</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST</option>
                <option value={28}>28% GST</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stock & Unit Section */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Stock & Unit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Unit of Measure
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="PIECE">PIECE (Pcs)</option>
                <option value="KG">KG (Kilograms)</option>
                <option value="GRAM">GRAM (Grams)</option>
                <option value="LITRE">LITRE (Ltr)</option>
                <option value="BOX">BOX (Boxes)</option>
                <option value="PACKET">PACKET (Pkt)</option>
                <option value="DOZEN">DOZEN (Dz)</option>
                <option value="BUNDLE">BUNDLE (Bdl)</option>
              </select>
            </div>

            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentStock === 0 ? '' : formData.currentStock}
                  placeholder="0"
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Low Stock Threshold Alert
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockLevel === 0 ? '' : formData.minStockLevel}
                placeholder="0"
                onFocus={(e) => e.target.select()}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notes / Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Product features, rack location, or internal notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/products"
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
            {isPending ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
