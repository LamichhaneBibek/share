'use client';

import { useState, useCallback, useEffect } from 'react';
import { Clock, FileJson2, Lock, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { TopNav } from '@/components/pasteglass/top-nav';
import { SideNav } from '@/components/pasteglass/side-nav';
import { PasteEditor } from '@/components/pasteglass/paste-editor';
import { RecentFeed } from '@/components/pasteglass/recent-feed';
import { ShareItem } from '@/lib/shares';

export default function Home() {
  const [shares, setShares] = useState<ShareItem[]>([]);
  const [newShareUrl, setNewShareUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchShares = async () => {
    try {
      const res = await fetch('/api/shares');
      if (res.ok) {
        const data = await res.json();
        setShares(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch shares:', error);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  const refresh = useCallback(() => {
    fetchShares();
  }, []);

  const handleShareCreated = (slug: string) => {
    setNewShareUrl(`${window.location.origin}/share/${slug}`);
    refresh();
  };

  const copyShareUrl = async () => {
    if (!newShareUrl) return;
    await navigator.clipboard.writeText(newShareUrl);
    toast.success('Link copied!');
  };

  const publicCount = shares.filter((s) => s.is_public === 1).length;
  const publicPct = shares.length ? Math.round((publicCount / shares.length) * 100) : 0;

  return (
    <div className="pasteglass-bg">
      <TopNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <SideNav
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        pasteCount={shares.length}
      />

      <main
        className={`pt-24 pb-12 px-4 md:px-6 transition-[margin] duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* New share URL banner */}
          {newShareUrl && (
            <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-pg-primary dark:text-pg-primary-soft flex-shrink-0" />
              <input
                readOnly
                value={newShareUrl}
                className="glass-input flex-1 rounded-lg px-3 py-2 text-sm font-mono dark:text-pg-paper min-w-0"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={copyShareUrl}
                className="primary-gradient text-white px-4 py-2 rounded-lg font-bold text-sm flex-shrink-0 hover:opacity-90 transition-opacity"
              >
                Copy
              </button>
              <button
                onClick={() => setNewShareUrl(null)}
                className="p-2 text-pg-outline hover:text-pg-primary transition-colors flex-shrink-0"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left/Center: Editor + features */}
            <section className="xl:col-span-8 space-y-6">
              <PasteEditor onShareCreated={handleShareCreated} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pg-primary/10 flex items-center justify-center text-pg-primary dark:text-pg-primary-soft">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-pg-ink dark:text-pg-paper">
                      Password Protect
                    </h4>
                    <p className="text-xs text-pg-outline dark:text-pg-outline-variant">
                      Lock pastes with a code
                    </p>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pg-secondary/10 flex items-center justify-center text-pg-secondary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-pg-ink dark:text-pg-paper">
                      Custom Expiry
                    </h4>
                    <p className="text-xs text-pg-outline dark:text-pg-outline-variant">
                      10 minutes to 15 days
                    </p>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-700 dark:text-blue-400">
                    <FileJson2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-pg-ink dark:text-pg-paper">
                      Raw & Download
                    </h4>
                    <p className="text-xs text-pg-outline dark:text-pg-outline-variant">
                      Plain-text raw view
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Right: Feed + stats */}
            <aside className="xl:col-span-4 space-y-6">
              <RecentFeed
                shares={shares}
                searchQuery={searchQuery}
                onDelete={refresh}
                onUpdate={refresh}
              />

              <div className="glass-panel p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-pg-primary dark:text-pg-primary-soft">
                    Your Pastes
                  </h4>
                  <span className="text-xs font-bold text-pg-ink dark:text-pg-paper">
                    {shares.length} total
                  </span>
                </div>
                <div className="w-full h-2 bg-pg-outline-variant/40 dark:bg-white/10 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full primary-gradient rounded-full transition-[width] duration-500"
                    style={{ width: `${publicPct}%` }}
                  />
                </div>
                <p className="text-xs text-pg-ink-soft dark:text-pg-outline-variant">
                  {publicCount} public · {shares.length - publicCount} unlisted. Pastes expire
                  after your chosen duration (up to 15 days).
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
