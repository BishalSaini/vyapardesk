import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getCurrentUser } from '@/lib/auth';
import { formatCurrency } from '@/lib/utils';
import { StatusBadge, getStockStatusBadge } from '@/components/shared/StatusBadge';
import { ProductsClient } from '@/components/products/ProductsClient';
import { serialize } from '@/lib/utils';

export const metadata = { title: 'Products — VyaparDesk' };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1');

  const [{ products, total, pages }, categories, user] = await Promise.all([
    getProducts({
      search: params.search,
      categoryId: params.category,
      page,
    }),
    getCategories(),
    getCurrentUser(),
  ]);

  return (
    <ProductsClient
      products={serialize(products)}
      categories={serialize(categories)}
      total={total}
      pages={pages}
      currentPage={page}
      isAdmin={user?.role === 'ADMIN'}
      searchQuery={params.search ?? ''}
      selectedCategory={params.category ?? ''}
    />
  );
}
