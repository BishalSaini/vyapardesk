'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  BarChart3,
  Truck,
  Users,
  FileText,
  Settings,
  ChevronRight,
  Store,
  ClipboardList,
  Boxes,
  ArrowLeftRight,
  Receipt,
  History,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  children?: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Sales',
    href: '/billing',
    icon: ShoppingCart,
    children: [
      { label: 'New Sale', href: '/billing', icon: Receipt },
      { label: 'Sales History', href: '/sales', icon: History },
    ],
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Boxes,
    children: [
      { label: 'Products', href: '/products', icon: Package },
      { label: 'Categories', href: '/categories', icon: Tag },
      { label: 'Stock Transactions', href: '/inventory/transactions', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Purchases',
    href: '/purchases',
    icon: ClipboardList,
    adminOnly: true,
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
    adminOnly: true,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    adminOnly: true,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    adminOnly: true,
  },
];

interface SidebarProps {
  userRole: 'ADMIN' | 'CASHIER';
  userName: string;
  shopName: string;
}

export function Sidebar({ userRole, userName, shopName }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === 'ADMIN';

  const filteredItems = navItems.filter(item => !item.adminOnly || isAdmin);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <aside className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-800 w-64 shrink-0 print:hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-lg shrink-0">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white text-sm truncate">{shopName}</p>
          <p className="text-slate-400 text-xs">VyaparDesk</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            if (item.children) {
              const anyChildActive = item.children.some(c => isActive(c.href));
              return (
                <li key={item.href}>
                  <div className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-default',
                    anyChildActive ? 'text-white' : 'text-slate-400'
                  )}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </div>
                  <ul className="ml-4 mt-1 space-y-1">
                    {item.children.map(child => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.href);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                              childActive
                                ? 'bg-blue-600 text-white font-medium'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            )}
                          >
                            <ChildIcon className="w-4 h-4 shrink-0" />
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className={cn(
              'text-xs font-medium',
              isAdmin ? 'text-blue-400' : 'text-green-400'
            )}>
              {isAdmin ? 'Admin' : 'Cashier'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
