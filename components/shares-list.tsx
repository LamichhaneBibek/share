import { useState } from 'react';
import { ShareItem } from '@/lib/shares';
import { Link2, Copy, Trash2, Lock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SharesListProps {
  shares: ShareItem[];
  onDelete: () => void;
}

export function SharesList({ shares, onDelete }: SharesListProps) {
  const router = useRouter();

  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}/share/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  const copyContent = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success('Content copied!');
  };

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/shares/${slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete share');
      }
      onDelete();
      toast.success('Share deleted');
    } catch (error) {
      toast.error('Failed to delete share');
    }
  };

  if (shares.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Link2 className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">No shares yet</p>
        <p className="text-xs mt-1">Create your first share to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {shares.map((share) => (
        <div
          key={share.id}
          className="group relative flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-card-hover transition-all duration-200 cursor-pointer"
          onClick={() => router.push(`/share/${share.slug}`)}
        >
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-foreground truncate max-w-[260px]">
                {share.content.length > 60
                  ? share.content.substring(0, 60) + '...'
                  : share.content}
              </p>
              {share.password && (
                <Lock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(share.created_at).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                copyLink(share.slug);
              }}
              title="Copy link"
            >
              <Link2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                copyContent(share.content);
              }}
              title="Copy content"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(share.slug);
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
