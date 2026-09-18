import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Truck, Calendar, User, FileText } from 'lucide-react';
import { getPurchaseById } from '@/lib/actions/purchases';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PurchaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseDetailPage({ params }: PurchaseDetailPageProps) {
  const { id } = await params;
  const purchase = await getPurchaseById(id);

  if (!purchase) {
    notFound();
  }

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Purchase Order Details</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ref No: {purchase.referenceNumber || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier</p>
          <p className="font-bold text-slate-900 dark:text-slate-100 text-base mt-1">{purchase.supplier.name}</p>
          {purchase.supplier.companyName && <p className="text-xs text-slate-500">{purchase.supplier.companyName}</p>}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Purchase Date</p>
          <p className="font-bold text-slate-900 dark:text-slate-100 text-base mt-1">{formatDate(purchase.purchaseDate)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bill</p>
          <p className="font-bold text-blue-600 dark:text-blue-400 text-2xl mt-1">{formatCurrency(purchase.total)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-100">
          Purchased Items
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {purchase.items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{item.product.name}</td>
                <td className="py-3 px-4 text-center font-bold">{item.quantity} {item.product.unit}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.purchasePrice)}</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
