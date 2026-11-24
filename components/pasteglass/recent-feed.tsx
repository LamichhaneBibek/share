'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Copy, EyeOff, Globe, Link2, Lock, Trash2 } from 'lucide-react';
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
    toast.success('Link copied');
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
    `h-8 px-3 rounded-md text-sm transition-colors duration-150 ${
      active
        ? 'bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-[#232838] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  const iconButton =
    'h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150';

  const emptyText = searchQuery.trim()
    ? 'No pastes match this search'
    : tab === 'recent'
    ? 'Nothing here yet. Pastes you publish show up in this list'
    : publicLoaded
    ? 'No public pastes right now'
    : 'Loading public pastes…';

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[560px] xl:h-[calc(100vh-104px)] xl:min-h-[560px] xl:sticky xl:top-20">
      <div className="h-14 px-4 flex items-center justify-between border-b border-border">
        <h2 className="text-sm font-medium text-foreground">
          {tab === 'recent' ? 'Your pastes' : 'Public pastes'}
          <span className="ml-2 font-mono text-xs text-muted-foreground tabular-nums">{items.length}</span>
        </h2>
        <div className="flex gap-1 p-1 bg-muted rounded-lg" role="tablist">
          <button role="tab" aria-selected={tab === 'recent'} className={tabClass(tab === 'recent')} onClick={() => setTab('recent')}>
            Mine
          </button>
          <button role="tab" aria-selected={tab === 'public'} className={tabClass(tab === 'public')} onClick={() => setTab('public')}>
            Public
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll p-2">
        {items.map((share) => (
          <article
            key={share.id}
            tabIndex={0}
            onClick={() => router.push(`/share/${share.slug}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') router.push(`/share/${share.slug}`);
            }}
            className="group px-3 py-3 rounded-xl hover:bg-muted/70 focus-visible:bg-muted/70 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-sm font-medium text-foreground truncate">
                {share.title?.trim() ||
                  (share.content.length > 40
                    ? share.content.substring(0, 40) + '…'
                    : share.content)}
              </h3>
              <span className="flex items-center gap-2 flex-none text-muted-foreground">
                {share.password && <Lock className="h-4 w-4" strokeWidth={1.5} aria-label="Password protected" />}
                {share.is_public === 1 && <Globe className="h-4 w-4" strokeWidth={1.5} aria-label="Public" />}
              </span>
            </div>
            <p className="font-mono text-xs leading-5 text-text-secondary line-clamp-2 mb-2 break-all">
              {share.content.substring(0, 120)}
            </p>
            <div className="flex items-center justify-between gap-2 h-8">
              <div className="flex items-center gap-2 min-w-0 font-mono text-xs text-muted-foreground">
                <span className="text-foreground/80">/{share.slug}</span>
                <span aria-hidden>·</span>
                <span className="truncate">{languageLabel(share.language)}</span>
                <span aria-hidden>·</span>
                <span className="truncate">
                  {formatDistanceToNow(parseDbDate(share.created_at), { addSuffix: true })}
                </span>
              </div>
              {tab === 'recent' && (
                <div className="flex items-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150">
                  <button
                    className={iconButton}
                    title={share.is_public === 1 ? 'Make unlisted' : 'Make public'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePublic(share.slug, share.is_public);
                    }}
                  >
                    {share.is_public === 1 ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <Globe className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                  <button
                    className={iconButton}
                    title="Copy link"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyLink(share.slug);
                    }}
                  >
                    <Link2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button
                    className={iconButton}
                    title="Copy content"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(share.content);
                      toast.success('Content copied');
                    }}
                  >
                    <Copy className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button
                    className={`${iconButton} hover:text-destructive`}
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(share.slug);
                    }}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}

        {items.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">{emptyText}</p>
        )}
      </div>

      <div className="h-10 px-4 flex items-center justify-between gap-4 border-t border-border bg-gutter font-mono text-xs text-muted-foreground">
        {latest ? (
          <>
            <span className="truncate">Last published /{latest.slug}</span>
            <span className="flex-none">
              {formatDistanceToNow(parseDbDate(latest.created_at), { addSuffix: true })}
            </span>
          </>
        ) : (
          <span>No activity yet</span>
        )}
      </div>
    </div>
  );
}
