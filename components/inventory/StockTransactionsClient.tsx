'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, History, Search, ArrowUpRight, ArrowDownLeft, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface StockTx {
  id: string;
  type: string;
  quantity: number;
  balanceAfter: number;
  reason: string | null;
  createdAt: Date | string;
  product: {
    name: string;
    sku: string;
    unit: string;
  };
  user: {
    name: string;
    email: string;
  } | null;
}

interface StockTransactionsClientProps {
  transactions: StockTx[];
}

export function StockTransactionsClient({ transactions }: StockTransactionsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filtered = transactions.filter((st) => {
    const matchesSearch =
      st.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.reason && st.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    if (selectedType !== 'ALL' && st.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/inventory"
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Stock Transactions Audit Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Complete audit trail of all purchases, sales, returns, and stock adjustments.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product, SKU, or audit notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="ALL">All Types</option>
          <option value="PURCHASE">PURCHASE (Stock In)</option>
          <option value="SALE">SALE (Stock Out)</option>
          <option value="SALE_RETURN">SALE_RETURN (Restocked)</option>
          <option value="ADJUSTMENT_IN">ADJUSTMENT_IN (+ Manual)</option>
          <option value="ADJUSTMENT_OUT">ADJUSTMENT_OUT (- Manual)</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Balance After</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">{formatDate(st.createdAt)}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{st.product.name}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-xs">{st.product.sku}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                        st.type === 'PURCHASE' || st.type === 'ADJUSTMENT_IN' || st.type === 'SALE_RETURN'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {st.quantity > 0 ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {st.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                    {st.quantity > 0 ? `+${st.quantity}` : st.quantity} <span className="text-xs font-normal text-slate-400">{st.product.unit}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 font-mono text-xs">{st.balanceAfter}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">{st.user?.name || 'System'}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs max-w-xs truncate">{st.reason || 'N/A'}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                    No stock transactions found matching filter.
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
