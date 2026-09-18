'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Truck, Phone, Mail, MapPin, FileText, Eye } from 'lucide-react';

interface SupplierItem {
  id: string;
  name: string;
  companyName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  isActive: boolean;
  _count: {
    products: number;
    purchases: number;
  };
}

interface SuppliersClientProps {
  suppliers: SupplierItem[];
  isAdmin: boolean;
}

export function SuppliersClient({ suppliers, isAdmin }: SuppliersClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.companyName && s.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.gstin && s.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Suppliers Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage wholesale suppliers, distributors, GSTIN numbers, and purchase orders.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/suppliers/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Supplier
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, company, or GSTIN number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-tight">{sup.name}</h3>
                    {sup.companyName && <p className="text-xs text-slate-500 dark:text-slate-400">{sup.companyName}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                {sup.phone && <p className="flex items-center gap-2 font-mono"><Phone className="w-3.5 h-3.5 text-slate-400" /> {sup.phone}</p>}
                {sup.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {sup.email}</p>}
                {sup.gstin && <p className="flex items-center gap-2 font-mono text-blue-600 dark:text-blue-400 font-medium">GSTIN: {sup.gstin}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {sup._count.products} Products
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {sup._count.purchases} Orders
                </span>
              </div>

              <Link
                href={`/suppliers/${sup.id}`}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <Eye className="w-3.5 h-3.5" /> Details
              </Link>
            </div>
          </div>
        ))}

        {filteredSuppliers.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
            <Truck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No suppliers found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Add vendor contacts to organize stock replenishment orders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
