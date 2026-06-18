'use client';

import { ThemeToggle } from './ThemeToggle';
import { MobileNav } from './MobileNav';
import { GlobalSearch } from './GlobalSearch';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4">
        <MobileNav />
        <div className="relative hidden w-full max-w-sm sm:block">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
