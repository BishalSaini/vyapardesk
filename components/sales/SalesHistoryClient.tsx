'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Eye, XCircle, FileText, Calendar, IndianRupee } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cancelSale } from '@/lib/actions/sales';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SaleItem {
  id: string;
  invoiceNumber: string;
  total: number | string | any;
  paymentMethod?: string;
  paymentStatus: string;
  status: string;
  createdAt: Date | string;
  customer: { name: string; phone: string } | null;
  user: { name: string };
  _count: { items: number };
}

interface SalesHistoryClientProps {
  sales: SaleItem[];
  isAdmin: boolean;
}

export function SalesHistoryClient({ sales: initialSales, isAdmin }: SalesHistoryClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [cancelModalSale, setCancelModalSale] = useState<SaleItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const filteredSales = initialSales.filter((s) => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customer && s.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.customer && s.customer.phone.includes(searchTerm));
    if (!matchesSearch) return false;
    if (selectedMethod !== 'ALL' && (s.paymentMethod ?? 'CASH') !== selectedMethod) return false;
    return true;
  });

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalSale) return;
    if (cancelReason.trim().length < 5) {
      toast({ title: 'Reason Required', description: 'Please enter a clear cancellation reason (min 5 characters)', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      try {
        const res = await cancelSale(cancelModalSale.id, cancelReason);
        if (res.success) {
          toast({ title: 'Sale Cancelled', description: 'Stock restocked and sale marked cancelled.' });
          setCancelModalSale(null);
          setCancelReason('');
          router.refresh();
        } else {
          toast({ title: 'Failed to Cancel', description: (res as any).error || 'Failed to cancel', variant: 'destructive' });
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to cancel sale', variant: 'destructive' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Sales History & Invoices</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View completed bills, print duplicate receipts, and handle admin order cancellations.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Invoice Number (e.g. INV-2026-000001), customer name, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="ALL">All Payment Modes</option>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
          <option value="CREDIT">Udhar / Credit</option>
        </select>
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Invoice No.</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Bill Total</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    <Link href={`/sales/${s.id}`}>{s.invoiceNumber}</Link>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">{formatDate(s.createdAt)}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {s.customer ? (
                      <div>
                        <p className="text-xs">{s.customer.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{s.customer.phone}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Walk-in Customer</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] rounded">
                      {s.paymentMethod || 'CASH'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        s.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(s.total)}
                  </td>
                  <td className="py-3 px-4 text-center space-x-2">
                    <Link
                      href={`/billing/complete/${s.id}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      title="View / Print Tax Invoice"
                    >
                      <Eye className="w-3.5 h-3.5" /> Invoice
                    </Link>

                    {isAdmin && s.status !== 'CANCELLED' && (
                      <button
                        onClick={() => setCancelModalSale(s)}
                        className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-medium ml-2"
                        title="Cancel sale and restore stock"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                    No sales invoices matched your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-bold text-rose-600 mb-1">Cancel Sale Invoice #{cancelModalSale.invoiceNumber}</h2>
            <p className="text-xs text-slate-500 mb-4">
              Cancelling this sale will automatically restore all item quantities back into active inventory stock.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Cancellation <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Customer returned items, wrong barcode scanned at billing..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCancelModalSale(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Nevermind
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
                >
                  {isPending && <LoadingSpinner />}
                  {isPending ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
