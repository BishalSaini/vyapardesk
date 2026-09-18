import { redirect } from 'next/navigation';
import { getSuppliers } from '@/lib/actions/suppliers';
import { getProducts } from '@/lib/actions/products';
import { getCurrentUser } from '@/lib/auth';
import { CreatePurchaseForm } from '@/components/purchases/CreatePurchaseForm';
import { serialize } from '@/lib/utils';

export default async function NewPurchasePage() {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    redirect('/purchases');
  }

  const [suppliersData, { products }] = await Promise.all([
    getSuppliers(),
    getProducts(),
  ]);

  return <CreatePurchaseForm suppliers={serialize(suppliersData.suppliers)} products={serialize(products)} />;
}
