import { redirect } from 'next/navigation';
import { getCategories } from '@/lib/actions/categories';
import { getSuppliers } from '@/lib/actions/suppliers';
import { getCurrentUser } from '@/lib/auth';
import { ProductForm } from '@/components/products/ProductForm';

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    redirect('/products');
  }

  const [categories, suppliersData] = await Promise.all([
    getCategories(),
    getSuppliers(),
  ]);

  return <ProductForm categories={categories} suppliers={suppliersData.suppliers} />;
}
