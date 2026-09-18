import { getStockTransactions } from '@/lib/actions/inventory';
import { StockTransactionsClient } from '@/components/inventory/StockTransactionsClient';
import { serialize } from '@/lib/utils';

export default async function StockTransactionsPage() {
  const transactions = await getStockTransactions();

  return <StockTransactionsClient transactions={serialize(transactions) as any} />;
}
