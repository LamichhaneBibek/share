'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { TopNav } from '@/components/pasteglass/top-nav';
import { languageLabel } from '@/lib/languages';
import { parseDbDate } from '@/lib/dates';

interface PublicShare {
  id: string;
  slug: string;
  content: string;
  title: string | null;
  language: string;
  password: string | null;
  expires_at: string | null;
  created_at: string;
}

const fmt = (d: string) =>
  parseDbDate(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function PublicFeedPage() {
  const [shares, setShares] = useState<PublicShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const res = await fetch('/api/public');
        if (res.ok) {
          const data = await res.json();
          setShares(data.items || []);
        }
      } catch {
        toast.error('Failed to load public pastes');
      } finally {
        setLoading(false);
      }
    };
    fetchPublic();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-[28px] leading-tight font-medium text-foreground mb-2">Public feed</h1>
          <p className="text-sm text-text-secondary">
            Pastes their authors chose to list. Anyone can open them.
          </p>
        </header>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {loading ? (
            <p className="py-12 text-center font-mono text-sm text-muted-foreground">Loading…</p>
          ) : shares.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <p className="text-sm text-foreground mb-1">No public pastes right now</p>
              <p className="text-sm text-muted-foreground mb-6">
                Set a paste to Public when you publish it and it will be listed here.
              </p>
              <Link
                href="/"
                className="inline-flex h-10 px-5 items-center rounded-lg bg-signal text-signal-foreground text-sm font-medium hover:bg-[#f4b84d] transition-colors duration-150"
              >
                New paste
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {shares.map((share) => (
                <li key={share.id}>
                  <Link
                    href={`/share/${share.slug}`}
                    className="block px-6 py-4 hover:bg-muted/70 focus-visible:bg-muted/70 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {share.title?.trim() ||
                          (share.content.length > 100
                            ? share.content.substring(0, 100) + '…'
                            : share.content)}
                      </p>
                      {share.password && (
                        <Lock
                          className="h-4 w-4 flex-none text-muted-foreground"
                          strokeWidth={1.5}
                          aria-label="Password protected"
                        />
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground flex flex-wrap gap-x-2 tabular-nums">
                      <span className="text-foreground/80">/{share.slug}</span>
                      <span aria-hidden>·</span>
                      <span>{languageLabel(share.language)}</span>
                      <span aria-hidden>·</span>
                      <span>{fmt(share.created_at)}</span>
                      {share.expires_at && (
                        <>
                          <span aria-hidden>·</span>
                          <span>Expires {fmt(share.expires_at)}</span>
                        </>
                      )}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
