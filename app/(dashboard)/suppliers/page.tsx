import { getSuppliers } from '@/lib/actions/suppliers';
import { getCurrentUser } from '@/lib/auth';
import { SuppliersClient } from '@/components/suppliers/SuppliersClient';
import { serialize } from '@/lib/utils';

export default async function SuppliersPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const { suppliers } = await getSuppliers();

  return <SuppliersClient suppliers={serialize(suppliers)} isAdmin={isAdmin} />;
}
