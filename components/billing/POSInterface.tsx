'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard, IndianRupee, QrCode, CheckCircle, AlertCircle, Barcode } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { completeSale } from '@/lib/actions/sales';
import { useToast } from '@/hooks/use-toast';

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  sellingPrice: number | string | any;
  taxPercent: number | string | any;
  currentStock: number;
  unit: string;
  category: { name: string };
}

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  outstandingAmount: number | string | any;
}

interface POSInterfaceProps {
  products: ProductItem[];
  customers: CustomerOption[];
}

interface CartItem {
  product: ProductItem;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discount: number;
}

export function POSInterface({ products: initialProducts, customers }: POSInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [products] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'CREDIT'>('CASH');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input on page load
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Filter products for grid
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchTerm))
  );

  // Handle barcode quick scan (exact match enter press)
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      const matchedProd = products.find(
        p => p.barcode === searchTerm.trim() || p.sku.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      if (matchedProd) {
        addToCart(matchedProd);
        setSearchTerm('');
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        setSearchTerm('');
      } else {
        toast({ title: 'Product Not Found', description: `No item matched: ${searchTerm}`, variant: 'destructive' });
      }
    }
  };

  const addToCart = (product: ProductItem) => {
    if (product.currentStock <= 0) {
      toast({ title: 'Out of Stock', description: `${product.name} has 0 stock available!`, variant: 'destructive' });
      return;
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIdx > -1) {
        const existing = prevCart[existingIdx];
        if (existing.quantity >= product.currentStock) {
          toast({ title: 'Stock Limit Reached', description: `Cannot add more than available stock (${product.currentStock})`, variant: 'destructive' });
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIdx] = { ...existing, quantity: existing.quantity + 1 };
        return updated;
      }
      return [
        ...prevCart,
        {
          product,
          quantity: 1,
          unitPrice: Number(product.sellingPrice),
          taxPercent: Number(product.taxPercent) || 0,
          discount: 0,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.currentStock) {
              toast({ title: 'Stock Limit', description: `Only ${item.product.currentStock} in stock`, variant: 'destructive' });
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter(item => item.product.id !== productId));
  };

  // Calculations
  const itemsSubtotal = cart.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxTotal = cart.reduce((acc, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    return acc + (itemTotal * (item.taxPercent / 100));
  }, 0);
  const finalTotal = Math.max(0, Math.round(itemsSubtotal + taxTotal - overallDiscount));
  const changeAmount = Math.max(0, amountReceived - finalTotal);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ title: 'Empty Cart', description: 'Please add products to the bill first', variant: 'destructive' });
      return;
    }

    if (paymentMethod === 'CREDIT' && !selectedCustomerId) {
      toast({ title: 'Customer Required', description: 'Please select or add a customer for Udhar / Credit sales', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          customerId: selectedCustomerId || null,
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            taxPercent: item.taxPercent,
          })),
          discount: overallDiscount,
          paymentMethod,
          amountReceived: paymentMethod === 'CASH' ? amountReceived : finalTotal,
          notes,
        };

        const res = await completeSale(payload);

        if (res.success && res.saleId) {
          toast({ title: 'Sale Completed! 🎉', description: `Invoice ${res.invoiceNumber} generated` });
          router.push(`/billing/complete/${res.saleId}`);
        } else {
          toast({ title: 'Checkout Failed', description: (res as any).error || 'Failed to complete sale', variant: 'destructive' });
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to complete sale', variant: 'destructive' });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6.5rem)]">
      {/* Left Column: Product Search & Grid (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4 h-full">
        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode or Search Product by Name/SKU (Press Enter to quick-add)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px] text-slate-500 font-mono">
            <Barcode className="w-3.5 h-3.5 text-blue-500" /> Scanner Ready
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map((product) => {
            const isOut = product.currentStock <= 0;
            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={isOut}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isOut
                    ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md active:scale-95'
                }`}
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                    {product.category.name}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1.5 line-clamp-2">{product.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">SKU: {product.sku}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                    {formatCurrency(product.sellingPrice)}
                  </span>
                  <span className={`text-[11px] font-semibold ${isOut ? 'text-rose-500' : 'text-slate-500'}`}>
                    {isOut ? 'Out of Stock' : `${product.currentStock} ${product.unit}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Billing Cart & Checkout (5 cols) */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
        {/* Cart Header & Customer Selection */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" /> Current Bill Cart ({cart.length})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Customer Dropdown */}
          <div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Walk-in Customer (Cash / UPI Sale)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) {Number(c.outstandingAmount) > 0 ? `— Udhar: ₹${c.outstandingAmount}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map((item) => (
            <div key={item.product.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">{item.product.name}</h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  {formatCurrency(item.unitPrice)} x {item.quantity} = <strong className="text-slate-900 dark:text-slate-100">{formatCurrency(item.quantity * item.unitPrice)}</strong>
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQuantity(item.product.id, -1)}
                  className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-bold text-xs text-slate-900 dark:text-slate-100">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, 1)}
                  className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cart is empty</p>
              <p className="text-xs text-slate-400 mt-0.5">Click any product or scan barcode to add</p>
            </div>
          )}
        </div>

        {/* Payment & Checkout Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 space-y-3">
          {/* Totals Breakdown */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Items Subtotal:</span>
              <span>{formatCurrency(itemsSubtotal)}</span>
            </div>
            {taxTotal > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>GST Tax Total:</span>
                <span>{formatCurrency(taxTotal)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-slate-500">
              <span>Bill Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={overallDiscount}
                onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-0.5 text-right text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded"
              />
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Grand Total:</span>
              <span className="text-blue-600 dark:text-blue-400">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Payment Mode
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['CASH', 'UPI', 'CARD', 'CREDIT'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMethod(mode)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    paymentMethod === mode
                      ? mode === 'CREDIT'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {mode === 'CREDIT' ? 'Udhar' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Change Calculator */}
          {paymentMethod === 'CASH' && (
            <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-xs">
              <div className="flex-1">
                <span className="text-slate-500 block text-[10px]">Cash Received (₹):</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-bold text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Return Change:</span>
                <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(changeAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleCheckout}
            disabled={isPending || cart.length === 0}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {isPending ? 'Processing Sale...' : `Complete Sale (${formatCurrency(finalTotal)})`}
          </button>
        </div>
      </div>
    </div>
  );
}
