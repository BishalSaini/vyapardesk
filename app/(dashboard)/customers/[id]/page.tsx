import { notFound } from 'next/navigation';
import { getCustomerById } from '@/lib/actions/customers';
import { CustomerDetailClient } from '@/components/customers/CustomerDetailClient';
import { serialize } from '@/lib/utils';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return <CustomerDetailClient customer={serialize(customer) as any} />;
}
