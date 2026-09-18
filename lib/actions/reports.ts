'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { getStartOfDay, getEndOfDay, getStartOfWeek, getStartOfMonth } from '@/lib/utils';
import { Decimal } from '@prisma/client/runtime/library';

export type DateRange = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

function getDateRange(range: DateRange, from?: string, to?: string) {
  const now = new Date();

  switch (range) {
    case 'today':
      return { from: getStartOfDay(now), to: getEndOfDay(now) };
    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return { from: getStartOfDay(yesterday), to: getEndOfDay(yesterday) };
    }
    case 'week':
      return { from: getStartOfWeek(now), to: getEndOfDay(now) };
    case 'month':
      return { from: getStartOfMonth(now), to: getEndOfDay(now) };
    case 'custom':
      return {
        from: from ? new Date(from) : getStartOfMonth(now),
        to: to ? new Date(to) : getEndOfDay(now),
      };
    default:
      return { from: getStartOfDay(now), to: getEndOfDay(now) };
  }
}

export async function getDashboardStats() {
  const today = { from: getStartOfDay(), to: getEndOfDay() };

  const [
    todaysSales,
    todaysBillCount,
    totalProducts,
    lowStockProducts,
    todaysPurchases,
    outstandingCredit,
    recentSales,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: { gte: today.from, lte: today.to }, status: 'COMPLETED' },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.count({
      where: { createdAt: { gte: today.from, lte: today.to }, status: 'COMPLETED' },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({
      where: {
        isActive: true,
        currentStock: { gt: 0 },
      },
    }),
    prisma.purchase.aggregate({
      where: { createdAt: { gte: today.from, lte: today.to } },
      _sum: { total: true },
    }),
    prisma.customer.aggregate({
      _sum: { outstandingAmount: true },
    }),
    prisma.sale.findMany({
      where: { status: 'COMPLETED' },
      include: { customer: { select: { name: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const lowStockCount = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM "Product"
    WHERE "isActive" = true AND "currentStock" <= "minStockLevel"
  `;

  return {
    todaysSalesTotal: parseFloat(todaysSales._sum.total?.toString() ?? '0'),
    todaysBillCount,
    totalProducts,
    lowStockCount: Number(lowStockCount[0]?.count ?? 0),
    todaysPurchasesTotal: parseFloat(todaysPurchases._sum.total?.toString() ?? '0'),
    outstandingCredit: parseFloat(outstandingCredit._sum.outstandingAmount?.toString() ?? '0'),
    recentSales,
  };
}

export async function getSalesChartData(days: number = 7) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const start = getStartOfDay(date);
    const end = getEndOfDay(date);

    const result = await prisma.sale.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'COMPLETED',
      },
      _sum: { total: true },
      _count: true,
    });

    data.push({
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      sales: parseFloat(result._sum.total?.toString() ?? '0'),
      count: result._count,
    });
  }
  return data;
}

export async function getTopSellingProducts(range: DateRange = 'month', limit: number = 10) {
  const { from, to } = getDateRange(range);

  const topProducts = await prisma.saleItem.groupBy({
    by: ['productId'],
    where: {
      sale: {
        createdAt: { gte: from, lte: to },
        status: 'COMPLETED',
      },
    },
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { total: 'desc' } },
    take: limit,
  });

  const productIds = topProducts.map(p => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true, unit: true },
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  return topProducts.map(tp => ({
    product: productMap.get(tp.productId),
    unitsSold: tp._sum.quantity ?? 0,
    revenue: parseFloat(tp._sum.total?.toString() ?? '0'),
  }));
}

export async function getTopProductsReport(days: number = 30) {
  await requireAdmin();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const topItems = await prisma.saleItem.groupBy({
    by: ['productId'],
    where: {
      sale: {
        createdAt: { gte: startDate },
        status: 'COMPLETED',
      },
    },
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { total: 'desc' } },
    take: 10,
  });

  const productIds = topItems.map(t => t.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true, unit: true },
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  return topItems.map(item => {
    const p = productMap.get(item.productId);
    return {
      id: item.productId,
      name: p?.name || 'Unknown Product',
      sku: p?.sku || 'N/A',
      unit: p?.unit || 'PIECE',
      totalQuantity: item._sum.quantity ?? 0,
      totalRevenue: parseFloat(item._sum.total?.toString() ?? '0'),
    };
  });
}

export async function getSalesReport(days: number = 30) {
  await requireAdmin();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sales = await prisma.sale.findMany({
    where: {
      createdAt: { gte: startDate },
      status: 'COMPLETED',
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total.toString()), 0);
  const totalBills = sales.length;
  const avgBillValue = totalBills > 0 ? totalRevenue / totalBills : 0;

  const dailyMap = new Map<string, { revenue: number; bills: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    dailyMap.set(dateStr, { revenue: 0, bills: 0 });
  }

  sales.forEach(s => {
    const dateStr = new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const current = dailyMap.get(dateStr) || { revenue: 0, bills: 0 };
    dailyMap.set(dateStr, {
      revenue: current.revenue + parseFloat(s.total.toString()),
      bills: current.bills + 1,
    });
  });

  const dailyData = Array.from(dailyMap.entries()).map(([date, val]) => ({
    date,
    revenue: val.revenue,
    bills: val.bills,
  }));

  return { totalRevenue, totalBills, avgBillValue, dailyData };
}

export async function getProfitReport(days: number = 30) {
  await requireAdmin();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const saleItems = await prisma.saleItem.findMany({
    where: {
      sale: {
        createdAt: { gte: startDate },
        status: 'COMPLETED',
      },
    },
    include: {
      product: { select: { purchasePrice: true } },
    },
  });

  let totalRevenue = 0;
  let totalCost = 0;

  saleItems.forEach(item => {
    const rev = parseFloat(item.total.toString());
    const cost = parseFloat(item.product.purchasePrice.toString()) * item.quantity;
    totalRevenue += rev;
    totalCost += cost;
  });

  const estimatedProfit = totalRevenue - totalCost;
  const profitMarginPercent = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCost,
    estimatedProfit,
    profitMarginPercent,
  };
}

export async function getInventoryReport() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { currentStock: true, minStockLevel: true, purchasePrice: true, sellingPrice: true },
  });

  const totalProducts = products.length;
  let totalStockQuantity = 0;
  let totalStockValueCost = 0;
  let totalStockValueSelling = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  products.forEach(p => {
    totalStockQuantity += p.currentStock;
    totalStockValueCost += parseFloat(p.purchasePrice.toString()) * p.currentStock;
    totalStockValueSelling += parseFloat(p.sellingPrice.toString()) * p.currentStock;
    if (p.currentStock === 0) outOfStockCount++;
    else if (p.currentStock <= p.minStockLevel) lowStockCount++;
  });

  return {
    totalProducts,
    totalStockQuantity,
    totalStockValueCost,
    totalStockValueSelling,
    potentialProfit: totalStockValueSelling - totalStockValueCost,
    lowStockCount,
    outOfStockCount,
  };
}

export async function getCustomerCreditReport() {
  await requireAdmin();

  const customers = await prisma.customer.findMany({
    where: { outstandingAmount: { gt: 0 } },
    select: { id: true, name: true, phone: true, outstandingAmount: true },
    orderBy: { outstandingAmount: 'desc' },
  });

  const totalCreditOutstanding = customers.reduce(
    (sum, c) => sum + parseFloat(c.outstandingAmount.toString()),
    0
  );

  return {
    totalCreditOutstanding,
    totalCustomersWithCredit: customers.length,
    customers: customers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      outstandingAmount: parseFloat(c.outstandingAmount.toString()),
    })),
  };
}
