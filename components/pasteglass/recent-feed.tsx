'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Copy, EyeOff, Globe, Link2, Lock, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ShareItem } from '@/lib/shares';
import { languageLabel } from '@/lib/languages';
import { parseDbDate } from '@/lib/dates';

interface RecentFeedProps {
  shares: ShareItem[];
  searchQuery: string;
  onDelete: () => void;
  onUpdate: () => void;
}

type Tab = 'recent' | 'public';

function matchesQuery(share: ShareItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    (share.title?.toLowerCase().includes(q) ?? false) ||
    share.content.toLowerCase().includes(q) ||
    languageLabel(share.language).toLowerCase().includes(q)
  );
}

export function RecentFeed({ shares, searchQuery, onDelete, onUpdate }: RecentFeedProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('recent');
  const [publicShares, setPublicShares] = useState<ShareItem[]>([]);
  const [publicLoaded, setPublicLoaded] = useState(false);

  useEffect(() => {
    if (tab !== 'public' || publicLoaded) return;
    const fetchPublic = async () => {
      try {
        const res = await fetch('/api/public');
        if (res.ok) {
          const data = await res.json();
          setPublicShares(data.items || []);
        }
      } catch {
        toast.error('Failed to load public feed');
      } finally {
        setPublicLoaded(true);
      }
    };
    fetchPublic();
  }, [tab, publicLoaded]);

  const copyLink = async (slug: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/share/${slug}`);
    toast.success('Link copied!');
  };

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/shares/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete share');
      onDelete();
      toast.success('Paste deleted');
    } catch {
      toast.error('Failed to delete paste');
    }
  };

  const handleTogglePublic = async (slug: string, currentIsPublic: number) => {
    try {
      const res = await fetch(`/api/shares/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: currentIsPublic === 0 }),
      });
      if (!res.ok) throw new Error('Failed to update share');
      onUpdate();
      setPublicLoaded(false);
      toast.success(currentIsPublic === 0 ? 'Paste is now public' : 'Paste is now unlisted');
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  const items = (tab === 'recent' ? shares : publicShares).filter((s) =>
    matchesQuery(s, searchQuery)
  );
  const latest = shares[0];

  const tabClass = (active: boolean) =>
    `flex-1 py-4 text-center text-xs font-semibold uppercase tracking-wider transition-colors ${
      active
        ? 'text-pg-primary dark:text-pg-primary-soft border-b-2 border-pg-primary bg-white/40 dark:bg-white/5'
        : 'text-pg-ink-soft dark:text-pg-outline-variant hover:text-pg-primary hover:bg-white/20 dark:hover:bg-white/5'
    }`;

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-[700px]">
      <div className="flex border-b border-pg-outline-variant/30">
        <button className={tabClass(tab === 'recent')} onClick={() => setTab('recent')}>
          My Recent
        </button>
        <button className={tabClass(tab === 'public')} onClick={() => setTab('public')}>
          Public Feed
        </button>
      </div>

      <div className="flex-1 overflow-y-auto glass-scroll p-4 space-y-4">
        {items.map((share) => (
          <article
            key={share.id}
            onClick={() => router.push(`/share/${share.slug}`)}
            className="group p-4 rounded-lg bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/5 hover:border-pg-primary/30 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-base font-semibold text-pg-ink dark:text-pg-paper group-hover:text-pg-primary dark:group-hover:text-pg-primary-soft transition-colors truncate mr-2">
                {share.title?.trim() ||
                  (share.content.length > 40
                    ? share.content.substring(0, 40) + '...'
                    : share.content)}
              </h4>
              <span className="flex items-center gap-1.5 flex-shrink-0">
                {share.password && <Lock className="h-4 w-4 text-amber-500" />}
                {share.is_public === 1 ? (
                  <Globe className="h-4 w-4 text-pg-primary dark:text-pg-primary-soft" />
                ) : (
                  <EyeOff className="h-4 w-4 text-pg-outline" />
                )}
              </span>
            </div>
            <p className="text-sm text-pg-ink-soft dark:text-pg-outline-variant line-clamp-2 mb-3 font-mono">
              {share.content.substring(0, 120)}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-pg-primary/10 text-pg-primary dark:text-pg-primary-soft text-[10px] font-bold rounded uppercase">
                  {languageLabel(share.language)}
                </span>
                <span className="text-xs text-pg-outline">
                  {formatDistanceToNow(parseDbDate(share.created_at), { addSuffix: true })}
                </span>
              </div>
              {tab === 'recent' && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1.5 text-pg-outline hover:text-pg-primary transition-colors"
                    title={share.is_public === 1 ? 'Make unlisted' : 'Make public'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePublic(share.slug, share.is_public);
                    }}
                  >
                    {share.is_public === 1 ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    className="p-1.5 text-pg-outline hover:text-pg-primary transition-colors"
                    title="Copy link"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyLink(share.slug);
                    }}
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 text-pg-outline hover:text-pg-primary transition-colors"
                    title="Copy content"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(share.content);
                      toast.success('Content copied!');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 text-pg-outline hover:text-red-500 transition-colors"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(share.slug);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}

        {items.length === 0 && (
          <div className="p-8 text-center space-y-3 opacity-60">
            <Sparkles className="h-10 w-10 mx-auto text-pg-outline-variant" />
            <p className="text-pg-ink-soft dark:text-pg-outline-variant text-sm italic">
              {searchQuery.trim()
                ? 'No pastes match your search.'
                : tab === 'recent'
                ? 'No pastes yet. Create your first one!'
                : publicLoaded
                ? 'No public pastes yet.'
                : 'Loading public feed...'}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/50 dark:bg-pg-ink/30 border-t border-pg-outline-variant/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-pg-ink-soft dark:text-pg-outline-variant uppercase tracking-wider">
            Latest Activity
          </span>
        </div>
        <div className="bg-black/5 dark:bg-white/5 rounded p-2 font-mono text-[10px] text-pg-ink-soft dark:text-pg-outline-variant overflow-hidden">
          {latest ? (
            <div className="flex justify-between">
              <span className="truncate mr-2"># {latest.slug} created</span>
              <span className="opacity-50 flex-shrink-0">
                {formatDistanceToNow(parseDbDate(latest.created_at), { addSuffix: true })}
              </span>
            </div>
          ) : (
            <span className="opacity-50"># no activity yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
