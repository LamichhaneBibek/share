'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { CopyButton } from '@/components/copy-button';

interface ShareFormProps {
  // called with the full share URL when a new share is created
  onShare?: (shareUrl: string) => void;
}

export function ShareForm({ onShare }: ShareFormProps) {
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content to share',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          password: password || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create share');
      }

      const data = await response.json();
      const fullUrl = `${window.location.origin}/share/${data.slug}`;
      setContent('');
      setPassword('');
      onShare?.(fullUrl);
      
      toast({
        title: 'Success',
        description: password ? 'Share created with password protection!' : 'Content shared successfully!',
      });
    } catch (error) {
      console.error('[v0] Error creating share:', error);
      const errorMsg = (error as Error).message;
      toast({
        title: 'Error',
        description: errorMsg || 'Failed to create share. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // form is always shown; parent component handles displaying the resulting link

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          What do you want to share?
        </label>
        <Textarea
          id="content"
          placeholder="Paste your link or text here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-32 resize-none"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password (optional)
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Leave empty for no password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          If set, viewers must enter this code to access the content
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !content.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Share...
          </>
        ) : (
          'Create Share'
        )}
      </Button>
    </form>
  );
}
