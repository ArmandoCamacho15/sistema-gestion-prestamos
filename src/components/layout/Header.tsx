'use client';

import { ThemeToggle } from './ThemeToggle';
import { MobileNav } from './MobileNav';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4">
        <MobileNav />
        <div className="relative hidden w-full max-w-sm sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar préstamos o clientes..."
            className="w-[300px] pl-9 lg:w-[400px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
