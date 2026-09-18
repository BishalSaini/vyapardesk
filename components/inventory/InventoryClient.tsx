'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, AlertTriangle, XCircle, CheckCircle, SlidersHorizontal, ArrowUpDown, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getStockStatusBadge, StatusBadge } from '@/components/shared/StatusBadge';

interface ProductInventory {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  purchasePrice: number | string | any;
  sellingPrice: number | string | any;
  category: { name: string };
  supplier: { name: string } | null;
}

interface InventoryClientProps {
  products: ProductInventory[];
  isAdmin: boolean;
}

export function InventoryClient({ products, isAdmin }: InventoryClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.currentStock > p.minStockLevel).length;
  const lowStockCount = products.filter(p => p.currentStock <= p.minStockLevel && p.currentStock > 0).length;
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;

  const totalStockValue = products.reduce(
    (acc, p) => acc + (p.currentStock * Number(p.purchasePrice)),
    0
  );

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'IN_STOCK') return p.currentStock > p.minStockLevel;
    if (filterStatus === 'LOW_STOCK') return p.currentStock <= p.minStockLevel && p.currentStock > 0;
    if (filterStatus === 'OUT_OF_STOCK') return p.currentStock === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Inventory Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track current stock levels, inventory valuation, and stock alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/inventory/transactions"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowUpDown className="w-4 h-4" /> Stock History
          </Link>
          {isAdmin && (
            <Link
              href="/inventory/adjust"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" /> Adjust Stock
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Items</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{totalProducts}</p>
          {isAdmin && (
            <p className="text-xs text-slate-500 mt-1">Valuation: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(totalStockValue)}</span></p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Healthy Stock</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{inStockCount}</p>
          <p className="text-xs text-slate-400 mt-1">Above threshold</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{lowStockCount}</p>
          <p className="text-xs text-slate-400 mt-1">Needs reorder soon</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Out of Stock</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-lg">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">{outOfStockCount}</p>
          <p className="text-xs text-slate-400 mt-1">Zero inventory</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All ({totalProducts})
          </button>
          <button
            onClick={() => setFilterStatus('IN_STOCK')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'IN_STOCK'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Healthy ({inStockCount})
          </button>
          <button
            onClick={() => setFilterStatus('LOW_STOCK')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'LOW_STOCK'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterStatus('OUT_OF_STOCK')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'OUT_OF_STOCK'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Current Stock</th>
                <th className="py-3 px-4 text-right">Min Threshold</th>
                {isAdmin && <th className="py-3 px-4 text-right">Stock Valuation</th>}
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                const stockBadge = getStockStatusBadge(p.currentStock, p.minStockLevel);
                const itemValuation = p.currentStock * Number(p.purchasePrice);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">{p.sku}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">{p.category.name}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={stockBadge} />
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      {p.currentStock} <span className="text-xs font-normal text-slate-500">{p.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 text-xs">{p.minStockLevel} {p.unit}</td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrency(itemValuation)}
                      </td>
                    )}
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/products/${p.id}`}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                      >
                        View History
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                    No products matched your inventory filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
