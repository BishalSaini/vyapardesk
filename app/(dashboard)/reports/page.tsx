import { redirect } from 'next/navigation';
import {
  getSalesReport,
  getProfitReport,
  getInventoryReport,
  getTopProductsReport,
  getCustomerCreditReport,
} from '@/lib/actions/reports';
import { getCurrentUser } from '@/lib/auth';
import { ReportsClient } from '@/components/reports/ReportsClient';

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [salesReport, profitReport, inventoryReport, topProducts, customerCredit] = await Promise.all([
    getSalesReport(30),
    getProfitReport(30),
    getInventoryReport(),
    getTopProductsReport(30),
    getCustomerCreditReport(),
  ]);

  return (
    <ReportsClient
      salesReport={salesReport}
      profitReport={profitReport}
      inventoryReport={inventoryReport}
      topProducts={topProducts as any}
      customerCredit={customerCredit as any}
    />
  );
}
