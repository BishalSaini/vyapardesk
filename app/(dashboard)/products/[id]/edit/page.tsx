import { notFound, redirect } from 'next/navigation';
import { getProductById } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getSuppliers } from '@/lib/actions/suppliers';
import { getCurrentUser } from '@/lib/auth';
import { ProductForm } from '@/components/products/ProductForm';
import { serialize } from '@/lib/utils';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    redirect('/products');
  }

  const [product, categories, suppliersData] = await Promise.all([
    getProductById(id),
    getCategories(),
    getSuppliers(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      initialData={{
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        purchasePrice: serialize(product.purchasePrice),
        sellingPrice: serialize(product.sellingPrice),
        taxPercent: serialize(product.taxPercent),
        currentStock: product.currentStock,
        minStockLevel: product.minStockLevel,
        unit: product.unit,
        description: product.description,
      }}
      categories={categories}
      suppliers={suppliersData.suppliers}
    />
  );
}
