'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Link2, Trash2, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { CopyButton } from '@/components/copy-button';

interface SharedItem {
  id: string;
  slug: string;
  content: string;
  password: string | null;
  created_at: string;
}

interface SharesListProps {
  refreshTrigger?: number;
}

interface PaginationData {
  items: SharedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function SharesList({ refreshTrigger }: SharesListProps) {
  const [shares, setShares] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const loadShares = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shares?page=${pageNum}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to load shares');
      }
      const data: PaginationData = await response.json();
      setShares(data.items);
      setPage(pageNum);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('[v0] Error loading shares:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shares',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares(1);
  }, [refreshTrigger]);

  const deleteShare = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this share?')) {
      return;
    }

    setDeleting(slug);
    try {
      const response = await fetch(`/api/shares/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete share');
      }

      setShares(shares.filter((s) => s.slug !== slug));
      toast({
        title: 'Deleted',
        description: 'Share deleted successfully',
      });
    } catch (error) {
      console.error('[v0] Error deleting share:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete share',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground">
        Loading your shares...
      </div>
    );
  }

  if (shares.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>No shares yet. Create your first share above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {shares.map((share) => (
          <Card
            key={share.id}
            className="p-4 hover:bg-muted/50 transition-colors border-border"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-foreground break-words line-clamp-2">
                    {share.content}
                  </p>
                  {share.password && (
                    <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" title="Password protected" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(share.created_at).toLocaleDateString()} at{' '}
                  {new Date(share.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/share/${share.slug}`}>
                  <Button size="sm" variant="ghost">
                    <Link2 className="w-4 h-4" />
                    <span className="sr-only">View share</span>
                  </Button>
                </Link>
                <div>
                  <CopyButton
                    content={`${window.location.origin}/share/${share.slug}`}
                    label=""
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteShare(share.slug)}
                  disabled={deleting === share.slug}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Delete share</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadShares(page - 1)}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadShares(page + 1)}
            disabled={page === totalPages || loading}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
