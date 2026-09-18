import { getSales } from '@/lib/actions/sales';
import { getCurrentUser } from '@/lib/auth';
import { SalesHistoryClient } from '@/components/sales/SalesHistoryClient';
import { serialize } from '@/lib/utils';

export default async function SalesPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const { sales } = await getSales();

  return <SalesHistoryClient sales={serialize(sales) as any} isAdmin={isAdmin} />;
}
