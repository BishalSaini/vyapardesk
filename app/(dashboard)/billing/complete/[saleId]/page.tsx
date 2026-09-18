import { notFound } from 'next/navigation';
import { getSaleById } from '@/lib/actions/sales';
import { getShopSettings } from '@/lib/actions/settings';
import { InvoicePrint } from '@/components/billing/InvoicePrint';
import { serialize } from '@/lib/utils';

interface CompletedSalePageProps {
  params: Promise<{ saleId: string }>;
}

export default async function CompletedSalePage({ params }: CompletedSalePageProps) {
  const { saleId } = await params;

  const [sale, settings] = await Promise.all([
    getSaleById(saleId),
    getShopSettings(),
  ]);

  if (!sale) {
    notFound();
  }

  return <InvoicePrint sale={serialize(sale)} shopSettings={serialize(settings)} />;
}
