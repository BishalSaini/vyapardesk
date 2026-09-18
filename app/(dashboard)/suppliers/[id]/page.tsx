import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, Phone, Mail, MapPin, Package, FileText } from 'lucide-react';
import { getSupplierById } from '@/lib/actions/suppliers';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SupplierDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  const { id } = await params;
  const supplier = await getSupplierById(id);

  if (!supplier) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/suppliers"
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{supplier.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{supplier.companyName || 'Wholesale Supplier'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact & GSTIN</p>
          <div className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {supplier.phone && <p className="flex items-center gap-2 font-mono"><Phone className="w-3.5 h-3.5 text-blue-500" /> {supplier.phone}</p>}
            {supplier.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {supplier.email}</p>}
            {supplier.gstin && <p className="flex items-center gap-2 font-mono text-blue-600 font-bold">GSTIN: {supplier.gstin}</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplied Products</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{supplier.products.length} <span className="text-xs font-normal text-slate-500">Items</span></p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Purchase Orders</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{supplier.purchases.length} <span className="text-xs font-normal text-slate-500">Orders</span></p>
        </div>
      </div>

      {/* Supplied Products List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-100">
          Products Supplied by {supplier.name}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Current Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {supplier.products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{p.name}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-xs">{p.sku}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(p.purchasePrice)}</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-medium">{formatCurrency(p.sellingPrice)}</td>
                  <td className="py-3 px-4 text-right font-bold">{p.currentStock} {p.unit}</td>
                </tr>
              ))}
              {supplier.products.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-slate-500">No linked products found for this supplier.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
