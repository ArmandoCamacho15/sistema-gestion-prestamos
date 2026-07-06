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
  ClipboardList,
  UserCheck,
  BarChart,
} from 'lucide-react';
import { useTeamRole } from '@/providers/TeamRoleProvider';
import { logout } from '@/lib/auth/actions';
import { Badge } from '@/components/ui/badge';

const roleLabels: Record<string, string> = {
  owner: 'Dueño',
  collector: 'Cobrador',
  secretary: 'Secretaria',
  supervisor: 'Supervisor',
};

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Préstamos', href: '/loans', icon: HandCoins },
  { name: 'Reportes', href: '/reportes', icon: BarChart },
  { name: 'Equipo', href: '/equipo', icon: UserCheck },
  { name: 'Configuración', href: '/settings', icon: Settings },
  { name: 'Auditoría', href: '/auditoria', icon: ClipboardList },
  { name: 'Ayuda', href: '/ayuda', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useTeamRole();

  const filteredNavigation = navigation.filter((item) => {
    if (role === 'owner') return true;
    if (role === 'supervisor') {
      return !['Equipo', 'Configuración'].includes(item.name);
    }
    if (role === 'secretary') {
      return !['Dashboard', 'Configuración', 'Auditoría', 'Equipo', 'Reportes'].includes(item.name);
    }
    if (role === 'collector') {
      return ['Préstamos', 'Clientes'].includes(item.name);
    }
    return false;
  });

  return (
    <div className="flex h-full flex-col border-r bg-card text-card-foreground">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="rounded-xl bg-primary p-1.5 text-primary-foreground shadow-lg shadow-primary/20">
            <Landmark className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">PrestamosApp</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-3">
        {/* Chip de rol */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
          <UserCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">
            Rol: <span className="font-semibold text-foreground">{roleLabels[role] ?? role}</span>
          </span>
        </div>

        <button
          onClick={() => logout()}
          className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut
            className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-destructive"
            aria-hidden="true"
          />
          Cerrar Sesión
        </button>
      </div>
    </div>

  );
}
