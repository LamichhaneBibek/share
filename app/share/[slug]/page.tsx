'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Home, Lock } from 'lucide-react';
import Link from 'next/link';

interface SharedItem {
  id: string;
  slug: string;
  content: string;
  password: string | null;
  created_at: string;
}

export default function SharePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [share, setShare] = useState<SharedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [incorrectPassword, setIncorrectPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadShare = async () => {
      try {
        const response = await fetch(`/api/shares/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          } else {
            throw new Error('Failed to load share');
          }
        } else {
          const data = await response.json();
          setShare(data);
          if (data.password) {
            setPasswordRequired(true);
          }
        }
      } catch (error) {
        console.error('[v0] Error loading share:', error);
        toast({
          title: 'Error',
          description: 'Failed to load share',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadShare();
  }, [slug, toast]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (share && share.password === passwordInput) {
      setPasswordRequired(false);
      setIncorrectPassword(false);
      setPasswordInput('');
    } else {
      setIncorrectPassword(true);
      toast({
        title: 'Incorrect',
        description: 'The password you entered is incorrect',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async () => {
    if (!share) return;
    
    try {
      await navigator.clipboard.writeText(share.content);
      setCopied(true);
      toast({
        title: 'Copied',
        description: 'Content copied to clipboard',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('[v0] Error copying to clipboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading share...</p>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="p-8 border-border text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Share Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              This share doesn't exist.
            </p>
            <Link href="/">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }
  if (!share) return null;

  // Show password prompt if needed
  if (passwordRequired) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <Card className="p-8 border-border">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground text-center mb-2">
              Password Protected
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Enter the password to view this share
            </p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setIncorrectPassword(false);
                }}
                autoFocus
                className={incorrectPassword ? 'border-red-500' : ''}
              />
              {incorrectPassword && (
                <p className="text-sm text-red-500">Incorrect password</p>
              )}
              <Button type="submit" className="w-full">
                Unlock
              </Button>
            </form>

            <Link href="/" className="block mt-6">
              <Button variant="ghost" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  // Show content
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="p-8 border-border">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-4">
              Created: {new Date(share.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {share.password && (
              <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password protected
              </p>
            )}
          </div>

          <div className="bg-muted rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
            <pre className="text-sm text-foreground whitespace-pre-wrap break-words font-mono">
              {share.content}
            </pre>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={copyToClipboard}
              variant={copied ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Content
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );

}
