import { getCategories } from '@/lib/actions/categories';
import { getCurrentUser } from '@/lib/auth';
import { CategoriesClient } from '@/components/categories/CategoriesClient';

export default async function CategoriesPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const categories = await getCategories();

  return <CategoriesClient categories={categories} isAdmin={isAdmin} />;
}
