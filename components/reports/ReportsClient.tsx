'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Users, Calendar, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ReportsClientProps {
  salesReport: {
    totalRevenue: number;
    totalBills: number;
    avgBillValue: number;
    dailyData: Array<{ date: string; revenue: number; bills: number }>;
  };
  profitReport: {
    totalRevenue: number;
    totalCost: number;
    estimatedProfit: number;
    profitMarginPercent: number;
  };
  inventoryReport: {
    totalProducts: number;
    totalStockQuantity: number;
    totalStockValueCost: number;
    totalStockValueSelling: number;
    potentialProfit: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sku: string;
    unit: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  customerCredit: {
    totalCreditOutstanding: number;
    totalCustomersWithCredit: number;
    customers: Array<{
      id: string;
      name: string;
      phone: string;
      outstandingAmount: number;
    }>;
  };
}

export function ReportsClient({
  salesReport,
  profitReport,
  inventoryReport,
  topProducts,
  customerCredit,
}: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<'sales' | 'profit' | 'inventory' | 'top_products' | 'credit'>('sales');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Business Intelligence & Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time financial breakdown, gross profit estimates, stock valuation, and credit ledgers.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'sales'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Sales Report
        </button>

        <button
          onClick={() => setActiveTab('profit')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'profit'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Profit Estimate
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" /> Inventory Valuation
        </button>

        <button
          onClick={() => setActiveTab('top_products')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'top_products'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Top Selling Items
        </button>

        <button
          onClick={() => setActiveTab('credit')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'credit'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Customer Udhar Ledger
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Revenue (30 Days)</p>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{formatCurrency(salesReport.totalRevenue)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Completed Bills</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">{salesReport.totalBills}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Average Bill Value</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(salesReport.avgBillValue)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Revenue Trend (Last 30 Days)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesReport.dailyData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickLine={false} style={{ fontSize: '11px' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Sales Revenue</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">{formatCurrency(profitReport.totalRevenue)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Goods Cost Price (COGS)</p>
              <p className="text-2xl font-extrabold text-slate-600 dark:text-slate-400 mt-2">{formatCurrency(profitReport.totalCost)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Estimated Gross Profit</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(profitReport.estimatedProfit)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Gross Profit Margin</p>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{profitReport.profitMarginPercent.toFixed(1)}%</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-900 dark:text-emerald-300">
            💡 <strong>Margin Note:</strong> Profit is calculated as <code>Selling Price - Purchase Cost Price</code> for all non-cancelled sale line items.
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Items & Units</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">{inventoryReport.totalProducts} <span className="text-xs font-normal text-slate-500">Items ({inventoryReport.totalStockQuantity} units)</span></p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Stock Cost Value</p>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">{formatCurrency(inventoryReport.totalStockValueCost)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Expected Retail Value</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(inventoryReport.totalStockValueSelling)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Potential Retail Profit</p>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{formatCurrency(inventoryReport.potentialProfit)}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'top_products' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 text-base">
            Top 10 Selling Products by Revenue
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
                <th className="py-3 px-4 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topProducts.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{p.name}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-xs">{p.sku}</td>
                  <td className="py-3 px-4 text-right font-bold">{p.totalQuantity} {p.unit}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'credit' && (
        <div className="space-y-4">
          <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase">Total Outstanding Udhar / Customer Credit</p>
              <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(customerCredit.totalCreditOutstanding)}</p>
            </div>
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-3 py-1 rounded-full">
              {customerCredit.totalCustomersWithCredit} Pending Accounts
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4 text-right">Outstanding Udhar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customerCredit.customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 text-xs">{c.phone}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-amber-600 dark:text-amber-400">{formatCurrency(c.outstandingAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
