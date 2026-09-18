import { redirect } from 'next/navigation';
import { getShopSettings } from '@/lib/actions/settings';
import { getCurrentUser } from '@/lib/auth';
import { SettingsForm } from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const settings = await getShopSettings();
  return <SettingsForm initialSettings={settings as any} />;
}
