'use client';

import { ThemeToggle } from './ThemeToggle';
import { MobileNav } from './MobileNav';
import { GlobalSearch } from './GlobalSearch';
import { useTeamRole } from '@/providers/TeamRoleProvider';
import { Badge } from '@/components/ui/badge';

const roleLabels: Record<string, string> = {
  owner: 'Dueño',
  collector: 'Cobrador',
  secretary: 'Secretaria',
  supervisor: 'Supervisor',
};

const roleVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  owner: 'default',
  collector: 'secondary',
  secretary: 'outline',
  supervisor: 'secondary',
};

export function Header() {
  const { role } = useTeamRole();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4">
        <MobileNav />
        <div className="relative hidden w-full max-w-sm sm:block">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={roleVariants[role] ?? 'outline'} className="capitalize hidden sm:flex">
          {roleLabels[role] ?? role}
        </Badge>
        <ThemeToggle />
      </div>
    </header>
  );
}
