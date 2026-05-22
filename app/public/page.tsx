'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Lock, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface PublicShare {
  id: string;
  slug: string;
  content: string;
  password: string | null;
  expires_at: string | null;
  created_at: string;
}

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
        toast.error('Failed to load public shares');
      } finally {
        setLoading(false);
      }
    };
    fetchPublic();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero py-12 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary-foreground" />
            <div>
              <h1 className="text-3xl font-extrabold text-primary-foreground">Public Feed</h1>
              <p className="text-primary-foreground/80 text-sm mt-0.5">
                Publicly shared content — visible to everyone
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 -mt-8 pb-12">
        <div className="bg-card rounded-2xl shadow-card border border-border p-6">
          {loading ? (
            <p className="text-muted-foreground text-center py-8 text-sm">Loading...</p>
          ) : shares.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Globe className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No public shares yet</p>
              <p className="text-xs mt-1">Be the first to share something publicly!</p>
              <Link href="/" className="mt-4">
                <Button size="sm" className="gradient-hero border-0 text-primary-foreground">
                  Create a share
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {shares.map((share) => (
                <Link href={`/share/${share.slug}`} key={share.id} className="block">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-card-hover transition-all duration-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {share.content.length > 100
                          ? share.content.substring(0, 100) + '...'
                          : share.content}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground">
                          {new Date(share.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {share.password && (
                          <span className="flex items-center gap-1 text-xs text-amber-500">
                            <Lock className="h-3 w-3" /> Protected
                          </span>
                        )}
                        {share.expires_at && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Expires{' '}
                            {new Date(share.expires_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
