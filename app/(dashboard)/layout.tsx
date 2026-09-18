import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/sign-in');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  
  if (!user) {
    redirect('/sign-in');
  }

  const settings = await prisma.shopSettings.findFirst();
  const shopName = settings?.shopName ?? 'My Shop';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden print:bg-white print:h-auto print:overflow-visible print:block">
      {/* Sidebar */}
      <Sidebar
        userRole={user.role}
        userName={user.name}
        shopName={shopName}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:block print:w-full">
        <TopNav shopName={shopName} />
        <main className="flex-1 overflow-y-auto p-6 print:p-0 print:m-0 print:overflow-visible print:w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
