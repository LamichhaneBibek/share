"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Search } from "lucide-react";

interface TopNavProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Wordmark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-1 text-base font-semibold text-foreground rounded-md"
    >
      Share&amp;Paste
      <span aria-hidden className="inline-block h-4 w-2 rounded-[1px] bg-signal" />
    </Link>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" strokeWidth={1.5} />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.5} />
      )}
    </button>
  );
}

export function TopNav({ searchQuery, onSearchChange }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 h-14 bg-background/95 border-b border-border">
      <div className="h-full max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        <Wordmark />
        <div className="flex items-center gap-2">
          {onSearchChange && (
            <div className="hidden md:block relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                strokeWidth={1.5}
              />
              <input
                className="field h-8 w-64 rounded-lg pl-9 pr-3 text-sm"
                placeholder="Search"
                type="search"
                aria-label="Search pastes"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          <Link
            href="/public"
            className="h-8 px-3 flex items-center rounded-lg text-sm text-text-secondary hover:text-foreground hover:bg-muted transition-colors duration-150"
          >
            Public feed
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
