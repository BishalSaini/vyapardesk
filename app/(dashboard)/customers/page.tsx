import { getCustomers } from '@/lib/actions/customers';
import { CustomersClient } from '@/components/customers/CustomersClient';
import { serialize } from '@/lib/utils';

export default async function CustomersPage() {
  const customers = await getCustomers();
  return <CustomersClient customers={serialize(customers)} />;
}
