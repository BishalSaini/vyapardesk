import { getProducts } from '@/lib/actions/products';
import { getCustomers } from '@/lib/actions/customers';
import { POSInterface } from '@/components/billing/POSInterface';
import { serialize } from '@/lib/utils';

export default async function BillingPage() {
  const [{ products }, customers] = await Promise.all([
    getProducts({ isActive: true }),
    getCustomers(),
  ]);

  return <POSInterface products={serialize(products)} customers={serialize(customers)} />;
}
