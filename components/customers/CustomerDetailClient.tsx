'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, MapPin, IndianRupee, FileText, Plus, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { recordCustomerPayment } from '@/lib/actions/customers';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  outstandingAmount: number | string | any;
  sales: Array<{
    id: string;
    invoiceNumber: string;
    total: number | string | any;
    paymentStatus: string;
    createdAt: Date | string;
  }>;
  payments: Array<{
    id: string;
    amount: number | string | any;
    method: string;
    reference: string | null;
    createdAt: Date | string;
  }>;
}

interface CustomerDetailClientProps {
  customer: CustomerDetail;
}

export function CustomerDetailClient({ customer }: CustomerDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(Number(customer.outstandingAmount) || 0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('UPI');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const outstanding = Number(customer.outstandingAmount);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Payment amount must be greater than 0', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      try {
        const res = await recordCustomerPayment({
          customerId: customer.id,
          amount: paymentAmount,
          method: paymentMethod,
          reference,
          notes,
        });

        if (res.success) {
          toast({ title: 'Payment Recorded', description: `Successfully received ₹${paymentAmount}` });
          setIsPaymentModalOpen(false);
          router.refresh();
        } else {
          toast({ title: 'Error', description: (res as any).error || 'Failed to record payment', variant: 'destructive' });
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to record payment', variant: 'destructive' });
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{customer.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">Mobile: {customer.phone}</p>
          </div>
        </div>

        {outstanding > 0 && (
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            <IndianRupee className="w-4 h-4" /> Receive Credit Payment (Jama)
          </button>
        )}
      </div>

      {/* Info & Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</p>
          <div className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <p className="flex items-center gap-2 font-mono"><Phone className="w-3.5 h-3.5 text-blue-500" /> {customer.phone}</p>
            {customer.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}</p>}
            {customer.address && <p className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" /> {customer.address}</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Outstanding Credit (Udhar)</p>
          <p className={`text-2xl font-bold mt-2 ${outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatCurrency(outstanding)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{outstanding > 0 ? 'Pending payment collection' : 'No pending dues'}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Summary</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{customer.sales.length} <span className="text-xs font-normal text-slate-500">Invoices</span></p>
          <p className="text-xs text-slate-400 mt-1">{customer.payments.length} Payments Received</p>
        </div>
      </div>

      {/* Tabs: Sales History & Payment Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Invoices */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Sales Invoices ({customer.sales.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {customer.sales.map((sale) => (
              <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <div>
                  <Link href={`/sales/${sale.id}`} className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    {sale.invoiceNumber}
                  </Link>
                  <p className="text-xs text-slate-400">{formatDate(sale.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{formatCurrency(sale.total)}</p>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded ${
                    sale.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sale.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
            {customer.sales.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">No invoices recorded yet.</div>
            )}
          </div>
        </div>

        {/* Payment Received Receipts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Payment Collection History ({customer.payments.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {customer.payments.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded">{p.method}</span>
                    {p.reference ? `Ref: ${p.reference}` : 'Direct Cash/UPI'}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(p.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">+{formatCurrency(p.amount)}</p>
                </div>
              </div>
            ))}
            {customer.payments.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">No credit payments received yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Receive Credit Payment</h2>
            <p className="text-xs text-slate-500 mb-4">Record partial or full payment received from {customer.name}.</p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount Received (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={outstanding}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Reference (UPI Txn ID / Cheque No.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/1293819238"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional receipt notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
                >
                  {isPending && <LoadingSpinner />}
                  {isPending ? 'Processing...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
