import { redirect } from 'next/navigation';
import { getInventoryStockLevels } from '@/lib/actions/inventory';
import { getCurrentUser } from '@/lib/auth';
import { StockAdjustmentForm } from '@/components/inventory/StockAdjustmentForm';

export default async function AdjustStockPage() {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    redirect('/inventory');
  }

  const products = await getInventoryStockLevels();
  const options = products.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    currentStock: p.currentStock,
    unit: p.unit,
  }));

  return <StockAdjustmentForm products={options} />;
}
