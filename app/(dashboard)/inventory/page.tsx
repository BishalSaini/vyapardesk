import { getInventoryStockLevels } from '@/lib/actions/inventory';
import { getCurrentUser } from '@/lib/auth';
import { InventoryClient } from '@/components/inventory/InventoryClient';

export default async function InventoryPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const products = await getInventoryStockLevels();

  return <InventoryClient products={products} isAdmin={isAdmin} />;
}
