'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  HandCoins,
  Settings,
  HelpCircle,
  LogOut,
  Landmark,
} from 'lucide-react';
import { logout } from '@/lib/auth/actions';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Préstamos', href: '/loans', icon: HandCoins },
  { name: 'Configuración', href: '/settings', icon: Settings },
  { name: 'Ayuda', href: '/ayuda', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Landmark className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">PrestamosApp</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary-foreground' : 'text-slate-400 group-hover:text-white'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={() => logout()}
          className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut
            className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-white"
            aria-hidden="true"
          />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
