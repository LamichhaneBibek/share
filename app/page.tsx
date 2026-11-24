'use client';

import { useState, useCallback, useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { TopNav } from '@/components/pasteglass/top-nav';
import { PasteEditor } from '@/components/pasteglass/paste-editor';
import { RecentFeed } from '@/components/pasteglass/recent-feed';
import { ShareItem } from '@/lib/shares';

export default function Home() {
  const [shares, setShares] = useState<ShareItem[]>([]);
  const [newShareUrl, setNewShareUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    toast.success('Link copied');
  };

  const publicCount = shares.filter((s) => s.is_public === 1).length;
  const protectedCount = shares.filter((s) => s.password).length;

  return (
    <div className="min-h-screen bg-background">
      <TopNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {newShareUrl && (
          <div className="rise mb-6 bg-card border border-border rounded-2xl p-4 md:pl-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text-secondary mb-1">Link ready</p>
              <p className="font-mono text-lg text-foreground truncate select-all">{newShareUrl}</p>
            </div>
            <div className="flex items-center gap-2 flex-none">
              <button
                onClick={copyShareUrl}
                className="h-10 px-5 rounded-lg bg-signal text-signal-foreground text-sm font-medium hover:bg-[#f4b84d] active:scale-[0.98] transition-[background-color,transform] duration-150"
              >
                Copy link
              </button>
              <a
                href={newShareUrl}
                className="h-10 px-4 rounded-lg border border-input text-sm text-foreground flex items-center gap-2 hover:bg-muted transition-colors duration-150"
              >
                Open <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <button
                onClick={() => setNewShareUrl(null)}
                className="h-10 w-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
                title="Dismiss"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
          <section className="space-y-4">
            <PasteEditor onShareCreated={handleShareCreated} />
            <p className="px-2 text-sm text-muted-foreground">
              Pastes expire after 10 minutes to 15 days. Each one has a raw view and a download, and
              can be locked with a password.
              <span className="block mt-1 font-mono text-xs tabular-nums">
                {shares.length} {shares.length === 1 ? 'paste' : 'pastes'} · {publicCount} public ·{' '}
                {shares.length - publicCount} unlisted · {protectedCount} protected
              </span>
            </p>
          </section>

          <RecentFeed
            shares={shares}
            searchQuery={searchQuery}
            onDelete={refresh}
            onUpdate={refresh}
          />
        </div>
      </main>
    </div>
  );
}
