import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Package, Tag, Truck, History, TrendingUp } from 'lucide-react';
import { getProductById } from '@/lib/actions/products';
import { getCurrentUser } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getStockStatusBadge, StatusBadge } from '@/components/shared/StatusBadge';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  const stockBadge = getStockStatusBadge(product.currentStock, product.minStockLevel);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{product.name}</h1>
              <StatusBadge status={stockBadge} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">SKU: {product.sku} {product.barcode ? `| Barcode: ${product.barcode}` : ''}</p>
          </div>
        </div>

        {isAdmin && (
          <Link
            href={`/products/${product.id}/edit`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Edit Product
          </Link>
        )}
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Stock</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {product.currentStock} <span className="text-xs font-normal text-slate-500">{product.unit}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Alert Level: {product.minStockLevel} {product.unit}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Selling Price</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(product.sellingPrice)}
          </p>
          <p className="text-xs text-slate-400 mt-1">GST Tax: {Number(product.taxPercent)}%</p>
        </div>

        {isAdmin && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Purchase Price</p>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1">
              {formatCurrency(product.purchasePrice)}
            </p>
            <p className="text-xs text-emerald-500 font-medium mt-1">
              Margin: {formatCurrency(Number(product.sellingPrice) - Number(product.purchasePrice))}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Category & Supplier</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-blue-500" /> {product.category.name}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
            <Truck className="w-3.5 h-3.5 text-slate-400" /> {product.supplier?.name || 'No supplier'}
          </p>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Description</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{product.description}</p>
        </div>
      )}

      {/* Stock Transaction Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Stock Movements History</h2>
          </div>
          <span className="text-xs text-slate-500">{product.stockTransactions.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Balance After</th>
                <th className="py-3 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {product.stockTransactions.map((st: any) => (
                <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(st.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        st.type === 'PURCHASE' || st.type === 'ADJUSTMENT_IN' || st.type === 'SALE_RETURN'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {st.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {st.quantity > 0 ? `+${st.quantity}` : st.quantity}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 font-mono">{st.balanceAfter}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate">
                    {st.reason || 'N/A'}
                  </td>
                </tr>
              ))}

              {product.stockTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                    No stock transaction history recorded yet.
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
