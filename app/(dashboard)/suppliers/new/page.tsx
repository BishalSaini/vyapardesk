import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { SupplierForm } from '@/components/suppliers/SupplierForm';

export default async function NewSupplierPage() {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    redirect('/suppliers');
  }

  return <SupplierForm />;
}
