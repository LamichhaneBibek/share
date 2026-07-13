'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Moon, Sun, Plus, Search } from 'lucide-react';

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateNew: () => void;
}

export function TopNav({ searchQuery, onSearchChange, onCreateNew }: TopNavProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-pg-ink/80 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm h-16 flex justify-between items-center px-4 md:px-6">
      <div className="flex items-center gap-8">
        <span className="text-2xl md:text-3xl font-black tracking-tighter text-pg-primary dark:text-pg-primary-soft">
          PasteGlass
        </span>
        <nav className="hidden md:flex gap-4">
          <Link
            className="text-xs font-semibold uppercase tracking-wider text-pg-primary dark:text-pg-primary-soft border-b-2 border-pg-primary pb-1"
            href="/"
          >
            My Pastes
          </Link>
          <Link
            className="text-xs font-semibold uppercase tracking-wider text-pg-ink-soft dark:text-pg-outline-variant hover:text-pg-primary transition-colors pb-1"
            href="/public"
          >
            Public Feed
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pg-outline h-4 w-4" />
          <input
            className="glass-input border-none rounded-full pl-9 pr-4 py-1.5 text-sm w-64 dark:text-pg-paper"
            placeholder="Search pastes..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button
          onClick={onCreateNew}
          className="bg-pg-primary hover:opacity-90 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">Create New</span>
        </button>
        <div className="flex items-center gap-2 border-l border-pg-outline-variant dark:border-pg-outline/30 pl-4 ml-2">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="text-pg-ink-soft dark:text-pg-outline-variant hover:text-pg-primary transition-colors p-2 rounded-full hover:bg-pg-primary/10"
            title="Toggle theme"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
