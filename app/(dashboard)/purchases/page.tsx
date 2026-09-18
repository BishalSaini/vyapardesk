import { getPurchases } from '@/lib/actions/purchases';
import { getCurrentUser } from '@/lib/auth';
import { PurchasesClient } from '@/components/purchases/PurchasesClient';
import { serialize } from '@/lib/utils';

export default async function PurchasesPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const { purchases } = await getPurchases();

  return <PurchasesClient purchases={serialize(purchases)} isAdmin={isAdmin} />;
}
