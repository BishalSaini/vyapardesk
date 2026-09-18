'use client';

import React from 'react';
import Link from 'next/link';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceSale {
  id: string;
  invoiceNumber: string;
  subtotal: number | string | any;
  discount: number | string | any;
  tax: number | string | any;
  total: number | string | any;
  paymentMethod?: string;
  paymentStatus: string;
  amountReceived?: number | string | any;
  changeGiven?: number | string | any;
  createdAt: Date | string;
  customer?: {
    name: string;
    phone?: string | null;
    address?: string | null;
  } | null;
  user: {
    name: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number | string | any;
    total: number | string | any;
    taxPercent?: number | string | any;
    product: {
      name: string;
      unit: string;
      sku: string;
      taxPercent?: number | string | any;
    };
  }>;
  payments?: Array<{
    method: string;
    amount: number | string | any;
    notes?: string | null;
  }>;
}

interface ShopSettings {
  shopName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  invoiceFooter: string | null;
}

interface InvoicePrintProps {
  sale: InvoiceSale;
  shopSettings: ShopSettings | null;
}

export function InvoicePrint({ sale, shopSettings }: InvoicePrintProps) {
  const handlePrint = () => {
    window.print();
  };

  const shopName = shopSettings?.shopName || 'VyaparDesk General Store';
  const shopAddress = shopSettings?.address || 'Main Market Road, New Delhi';
  const shopPhone = shopSettings?.phone || '9876543210';
  const gstin = shopSettings?.gstin || '';
  const footer = shopSettings?.invoiceFooter || 'Thank you for shopping with us! Please visit again.';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5" /> Sale Completed Successfully!
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-300 dark:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Next POS Sale
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Tax Invoice
          </button>
        </div>
      </div>

      {/* Printable Invoice Paper Sheet */}
      <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-200 shadow-lg print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="border-b pb-4 mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{shopName}</h1>
            <p className="text-xs text-slate-600 max-w-xs mt-0.5">{shopAddress}</p>
            <p className="text-xs text-slate-600">Ph: {shopPhone} {gstin ? `| GSTIN: ${gstin}` : ''}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-bold rounded uppercase tracking-wider mb-1">
              TAX INVOICE
            </span>
            <p className="font-mono font-bold text-sm text-slate-900 whitespace-nowrap">{sale.invoiceNumber}</p>
            <p className="text-xs text-slate-500">{formatDate(sale.createdAt)}</p>
          </div>
        </div>

        {/* Customer & Billed By */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div>
            <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Customer Details</p>
            <p className="font-bold text-slate-900 mt-0.5">{sale.customer?.name || 'Walk-in Customer'}</p>
            {sale.customer?.phone && <p className="text-slate-600 font-mono">Mobile: {sale.customer.phone}</p>}
            {sale.customer?.address && <p className="text-slate-600">{sale.customer.address}</p>}
          </div>

          <div className="text-right">
            <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Billing Info</p>
            <p className="text-slate-700 mt-0.5">Payment Mode: <strong className="font-bold">{sale.paymentMethod || sale.payments?.[0]?.method || 'CASH'}</strong></p>
            <p className="text-slate-700">Cashier: {sale.user.name}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left text-xs mb-6">
          <thead className="border-b-2 border-slate-200 text-slate-600 font-semibold uppercase">
            <tr>
              <th className="py-2">Item Description</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Tax %</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sale.items.map((item) => {
              const taxPct = Number(item.taxPercent ?? item.product?.taxPercent ?? 0);
              return (
                <tr key={item.id}>
                  <td className="py-2.5 font-semibold text-slate-900">{item.product.name}</td>
                  <td className="py-2.5 text-center font-bold">{item.quantity} {item.product.unit}</td>
                  <td className="py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2.5 text-right text-slate-500">{isNaN(taxPct) ? '0' : taxPct}%</td>
                  <td className="py-2.5 text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary Breakdown */}
        <div className="border-t border-slate-200 pt-3 flex justify-end">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>

            {Number(sale.tax) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST Tax:</span>
                <span>{formatCurrency(sale.tax)}</span>
              </div>
            )}

            {Number(sale.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount:</span>
                <span>-{formatCurrency(sale.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-extrabold border-t border-slate-900 pt-2 text-slate-900">
              <span>Grand Total:</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>

            {sale.paymentMethod === 'CASH' && Number(sale.amountReceived) > 0 && (
              <div className="pt-2 text-[11px] text-slate-500 border-t border-dashed space-y-0.5">
                <div className="flex justify-between">
                  <span>Cash Received:</span>
                  <span>{formatCurrency(sale.amountReceived)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Change Given:</span>
                  <span>{formatCurrency(sale.changeGiven)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">{footer}</p>
          <p className="text-[10px] text-slate-400 mt-1">Computer Generated Tax Invoice • VyaparDesk POS</p>
        </div>
      </div>
    </div>
  );
}
