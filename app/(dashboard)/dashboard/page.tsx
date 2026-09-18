import {
  getDashboardStats,
  getSalesChartData,
  getTopSellingProducts,
} from '@/lib/actions/reports';
import { getLowStockProducts } from '@/lib/actions/products';
import { getCurrentUser } from '@/lib/auth';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge, getStockStatusBadge } from '@/components/shared/StatusBadge';
import { SalesChart } from '@/components/dashboard/SalesChart';
import {
  TrendingUp,
  FileText,
  Package,
  AlertTriangle,
  ShoppingBag,
  CreditCard,
  Plus,
  PackagePlus,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard — VyaparDesk',
};

export default async function DashboardPage() {
  const [stats, chartData, topProducts, lowStockProducts, user] = await Promise.all([
    getDashboardStats(),
    getSalesChartData(7),
    getTopSellingProducts('month', 5),
    getLowStockProducts(),
    getCurrentUser(),
  ]);

  const kpiCards = [
    {
      label: "Today's Sales",
      value: formatCurrency(stats.todaysSalesTotal),
      sub: `${stats.todaysBillCount} bill${stats.todaysBillCount !== 1 ? 's' : ''}`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: "Today's Bills",
      value: stats.todaysBillCount.toString(),
      sub: 'Completed sales',
      icon: FileText,
      color: 'bg-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts.toString(),
      sub: 'Active products',
      icon: Package,
      color: 'bg-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: 'Low Stock',
      value: stats.lowStockCount.toString(),
      sub: 'Need attention',
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? 'bg-amber-500' : 'bg-slate-400',
      bg: stats.lowStockCount > 0 ? 'bg-amber-50' : 'bg-slate-50',
    },
    {
      label: "Today's Purchases",
      value: formatCurrency(stats.todaysPurchasesTotal),
      sub: 'Stock received',
      icon: ShoppingBag,
      color: 'bg-indigo-500',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Outstanding Credit',
      value: formatCurrency(stats.outstandingCredit),
      sub: 'Customer dues',
      icon: CreditCard,
      color: stats.outstandingCredit > 0 ? 'bg-red-500' : 'bg-slate-400',
      bg: stats.outstandingCredit > 0 ? 'bg-red-50' : 'bg-slate-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back, {user?.name}! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/billing"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Sale
        </Link>
        {user?.role === 'ADMIN' && (
          <>
            <Link
              href="/products/new"
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Package className="w-4 h-4" />
              Add Product
            </Link>
            <Link
              href="/purchases/new"
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <PackagePlus className="w-4 h-4" />
              Stock In
            </Link>
          </>
        )}
        <Link
          href="/customers/new"
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{card.label}</p>
                <p className="text-slate-900 text-xl font-bold mt-0.5">{card.value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold">Sales — Last 7 Days</h2>
          </div>
          <SalesChart data={chartData} />
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold">Top Products (Month)</h2>
            <Link href="/reports" className="text-blue-600 text-xs hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No sales yet this month</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((tp, idx) => (
                <li key={tp.product?.id ?? idx} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm font-medium truncate">{tp.product?.name}</p>
                    <p className="text-slate-400 text-xs">{tp.unitsSold} units sold</p>
                  </div>
                  <CurrencyDisplay amount={tp.revenue} size="sm" className="text-slate-600 font-medium shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Sales & Low Stock Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold">Recent Sales</h2>
            <Link href="/sales" className="text-blue-600 text-xs hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recentSales.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No sales yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentSales.map((sale) => (
                <Link
                  key={sale.id}
                  href={`/sales/${sale.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <p className="text-slate-700 text-sm font-medium">{sale.invoiceNumber}</p>
                    <p className="text-slate-400 text-xs">
                      {sale.customer?.name ?? 'Walk-in'} · {sale.user.name}
                    </p>
                    <p className="text-slate-400 text-xs">{formatDateTime(sale.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={sale.total} size="sm" className="text-slate-800 font-semibold" />
                    <div className="mt-1">
                      <StatusBadge status={sale.paymentStatus as any} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 font-semibold">Low Stock Alerts</h2>
            <Link href="/inventory" className="text-blue-600 text-xs hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">All products are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-slate-700 text-sm font-medium">{product.name}</p>
                    <p className="text-slate-400 text-xs">{product.category.name} · {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${product.currentStock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {product.currentStock} {product.unit.toLowerCase()}
                    </p>
                    <StatusBadge status={getStockStatusBadge(product.currentStock, product.minStockLevel)} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
