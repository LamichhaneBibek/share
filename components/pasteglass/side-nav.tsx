'use client';

import Link from 'next/link';
import {
  Terminal,
  History,
  Globe,
  FileCode2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SideNavProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  pasteCount: number;
}

export function SideNav({ collapsed, onToggleCollapse, pasteCount }: SideNavProps) {
  return (
    <aside
      className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 p-4 gap-8 bg-white/60 dark:bg-pg-ink/60 backdrop-blur-2xl border-r border-white/10 shadow-lg z-40 transition-[width] duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`flex items-center px-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <h3 className="text-xs font-semibold uppercase tracking-wider text-pg-outline dark:text-pg-outline-variant">
            Menu
          </h3>
        )}
        <button
          onClick={onToggleCollapse}
          className="text-pg-ink-soft dark:text-pg-outline-variant hover:text-pg-primary transition-colors p-1 rounded-md hover:bg-pg-primary/10"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={`rounded-xl bg-pg-primary/5 dark:bg-white/5 border border-white/10 ${
          collapsed ? 'p-2' : 'p-4'
        }`}
      >
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 min-w-[40px] rounded-lg primary-gradient flex items-center justify-center text-white shadow-lg">
            <Terminal className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h3 className="text-lg font-semibold text-pg-primary dark:text-pg-primary-soft leading-tight truncate">
                Personal
              </h3>
              <p className="text-sm text-pg-ink-soft dark:text-pg-outline-variant">
                {pasteCount} paste{pasteCount === 1 ? '' : 's'}
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <Link
          className={`flex items-center gap-3 py-3 bg-pg-primary/15 dark:bg-pg-primary/30 text-pg-primary dark:text-pg-primary-soft rounded-lg font-bold transition-all ${
            collapsed ? 'justify-center px-0' : 'px-4'
          }`}
          href="/"
        >
          <History className="h-5 w-5" />
          {!collapsed && <span className="text-sm">My Pastes</span>}
        </Link>
        <Link
          className={`flex items-center gap-3 py-3 text-pg-ink-soft dark:text-pg-outline-variant hover:bg-pg-primary/10 dark:hover:bg-white/10 rounded-lg transition-all ${
            collapsed ? 'justify-center px-0' : 'px-4'
          }`}
          href="/public"
        >
          <Globe className="h-5 w-5" />
          {!collapsed && <span className="text-sm">Public Feed</span>}
        </Link>
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4">
        <div
          className={`flex items-center gap-3 py-2 text-pg-ink-soft dark:text-pg-outline-variant ${
            collapsed ? 'justify-center px-0' : 'px-4'
          }`}
          title="Pastes expire after your chosen duration (up to 15 days)"
        >
          <FileCode2 className="h-5 w-5" />
          {!collapsed && (
            <span className="text-xs leading-tight">
              Pastes expire after up to 15 days
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
