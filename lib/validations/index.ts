import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(100),
  sku: z.string().min(2, 'SKU must be at least 2 characters').max(50).regex(/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens and underscores'),
  barcode: z.string().max(50).optional().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  supplierId: z.string().optional().nullable(),
  purchasePrice: z.coerce.number().min(0, 'Purchase price cannot be negative'),
  sellingPrice: z.coerce.number().min(0.01, 'Selling price must be greater than 0'),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
  currentStock: z.coerce.number().int().min(0).default(0),
  minStockLevel: z.coerce.number().int().min(0).default(5),
  unit: z.enum(['PIECE', 'KG', 'GRAM', 'LITRE', 'BOX', 'PACKET', 'DOZEN', 'BUNDLE']).default('PIECE'),
  description: z.string().max(500).default(''),
}).refine(data => data.sellingPrice >= data.purchasePrice, {
  message: 'Selling price should be at least equal to purchase price',
  path: ['sellingPrice'],
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(50),
  description: z.string().max(200).default(''),
});

export const supplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  companyName: z.string().max(100).default(''),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').or(z.string().length(0)),
  email: z.string().email('Invalid email address').or(z.string().length(0)),
  address: z.string().max(300).default(''),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format').or(z.string().length(0)),
  notes: z.string().max(500).default(''),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number (must be 10 digits starting with 6-9)'),
  email: z.string().email('Invalid email address').or(z.string().length(0)),
  address: z.string().max(300).default(''),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
});

export const saleSchema = z.object({
  customerId: z.string().optional().nullable(),
  items: z.array(cartItemSchema).min(1, 'Sale must have at least one item'),
  discount: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'CREDIT']),
  amountReceived: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).default(''),
}).refine(data => {
  if (data.paymentMethod === 'CREDIT' && !data.customerId) {
    return false;
  }
  return true;
}, {
  message: 'Customer is required for credit sales',
  path: ['customerId'],
});

export const purchaseSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  referenceNumber: z.string().max(50).default(''),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    purchasePrice: z.coerce.number().min(0, 'Purchase price cannot be negative'),
    taxPercent: z.coerce.number().min(0).max(100).default(0),
  })).min(1, 'Purchase must have at least one item'),
  discount: z.coerce.number().min(0).default(0),
  paymentStatus: z.enum(['PAID', 'PARTIAL', 'UNPAID']).default('PAID'),
  notes: z.string().max(500).default(''),
  status: z.enum(['PENDING', 'RECEIVED', 'PARTIAL', 'CANCELLED']).default('RECEIVED'),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().refine(n => n !== 0, 'Quantity cannot be zero'),
  reason: z.string().min(5, 'Please provide a reason for this adjustment (min 5 characters)').max(300),
});

export const paymentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  method: z.enum(['CASH', 'UPI', 'CARD', 'CREDIT']),
  reference: z.string().max(100).default(''),
  notes: z.string().max(300).default(''),
});

export const shopSettingsSchema = z.object({
  shopName: z.string().min(2, 'Shop name must be at least 2 characters').max(100),
  address: z.string().max(300).default(''),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number').or(z.string().length(0)),
  email: z.string().email('Invalid email').or(z.string().length(0)),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN').or(z.string().length(0)),
  invoicePrefix: z.string().min(1).max(10).default('INV'),
  invoiceFooter: z.string().max(200).default('Thank you for shopping with us!'),
  taxName: z.string().max(20).default('GST'),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ShopSettingsInput = z.infer<typeof shopSettingsSchema>;
