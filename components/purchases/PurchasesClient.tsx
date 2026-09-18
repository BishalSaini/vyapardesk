'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, ShoppingBag, Eye, Calendar, User } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface PurchaseItem {
  id: string;
  referenceNumber: string | null;
  purchaseDate: Date | string;
  total: number | string | any;
  paymentStatus: string;
  status: string;
  supplier: { name: string; companyName: string | null };
  user: { name: string };
  _count: { items: number };
}

interface PurchasesClientProps {
  purchases: PurchaseItem[];
  isAdmin: boolean;
}

export function PurchasesClient({ purchases, isAdmin }: PurchasesClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPurchases = purchases.filter((p) =>
    p.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.supplier.companyName && p.supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Stock Purchase Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Record stock replenishment from suppliers and automatically update inventory balances.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/purchases/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Purchase Order
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by supplier name, company, or reference number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Purchase Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Ref / Bill No.</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPurchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">{formatDate(p.purchaseDate)}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {p.supplier.name}
                    {p.supplier.companyName && <span className="block text-xs font-normal text-slate-500">{p.supplier.companyName}</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{p.referenceNumber || 'N/A'}</td>
                  <td className="py-3 px-4 text-center font-medium">{p._count.items}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">{formatCurrency(p.total)}</td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/purchases/${p.id}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                    No purchase orders recorded yet.
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
