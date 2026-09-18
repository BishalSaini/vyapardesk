'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { StatusBadge, getStockStatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { deactivateProduct } from '@/lib/actions/products';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Search, Filter, Package, Edit, Eye, Trash2,
  ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';

interface ProductsClientProps {
  products: any[];
  categories: any[];
  total: number;
  pages: number;
  currentPage: number;
  isAdmin: boolean;
  searchQuery: string;
  selectedCategory: string;
}

export function ProductsClient({
  products, categories, total, pages, currentPage, isAdmin, searchQuery, selectedCategory
}: ProductsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchQuery);
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/products?search=${encodeURIComponent(search)}`);
  }

  function handleCategoryChange(categoryId: string) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryId) params.set('category', categoryId);
    router.push(`/products?${params.toString()}`);
  }

  function handleDeactivate(id: string) {
    startTransition(async () => {
      try {
        await deactivateProduct(id);
        toast({ title: 'Product deactivated', variant: 'default' as any });
        router.refresh();
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      }
      setConfirmDeactivate(null);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-slate-500 text-sm">{total} products total</p>
        </div>
        {isAdmin && (
          <Link
            href="/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, SKU, or barcode..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Search
            </button>
          </form>

          <select
            value={selectedCategory}
            onChange={e => handleCategoryChange(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No products found</p>
            <p className="text-slate-400 text-sm mt-1">
              {search ? `No results for "${search}"` : 'Add your first product to start managing inventory.'}
            </p>
            {isAdmin && (
              <Link href="/products/new" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Purchase</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Selling</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-slate-800 font-medium text-sm">{product.name}</p>
                        <p className="text-slate-400 text-xs">{product.sku}</p>
                        {product.barcode && <p className="text-slate-400 text-xs">🔢 {product.barcode}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600 text-sm">{product.category?.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin ? (
                        <CurrencyDisplay amount={product.purchasePrice} size="sm" className="text-slate-600" />
                      ) : (
                        <span className="text-slate-400 text-xs">Hidden</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CurrencyDisplay amount={product.sellingPrice} size="sm" className="text-slate-800 font-medium" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <span className={`text-sm font-semibold ${
                          product.currentStock === 0 ? 'text-red-600' :
                          product.currentStock <= product.minStockLevel ? 'text-amber-600' : 'text-slate-800'
                        }`}>
                          {product.currentStock}
                        </span>
                        <span className="text-slate-400 text-xs ml-1">{product.unit.toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={getStockStatusBadge(product.currentStock, product.minStockLevel)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${product.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                          <>
                            <Link href={`/products/${product.id}/edit`} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setConfirmDeactivate(product.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Deactivate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">Page {currentPage} of {pages}</p>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link href={`/products?page=${currentPage - 1}${search ? `&search=${search}` : ''}`}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Link>
              )}
              {currentPage < pages && (
                <Link href={`/products?page=${currentPage + 1}${search ? `&search=${search}` : ''}`}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                  Next <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Deactivate Dialog */}
      {confirmDeactivate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-slate-800 font-semibold">Deactivate Product</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to deactivate this product? It will be hidden from billing but all history will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeactivate(null)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeactivate(confirmDeactivate)}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
