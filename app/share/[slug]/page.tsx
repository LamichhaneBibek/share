'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, ArrowLeft, Lock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

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

  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [incorrect, setIncorrect] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

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
        }
      } catch (error) {
        console.error('Error loading share:', error);
        toast.error('Failed to load share');
      } finally {
        setLoading(false);
      }
    };

    loadShare();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-muted-foreground">Loading share...</p>
      </div>
    );
  }

  if (notFound || !share) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Share Not Found</h1>
          <p className="text-muted-foreground text-sm">
            This share doesn't exist or has been deleted.
          </p>
          <Link href="/">
            <Button variant="outline" className="mt-2">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const needsPassword = share.password && !unlocked;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === share.password) {
      setUnlocked(true);
      setIncorrect(false);
    } else {
      setIncorrect(true);
      toast.error('Incorrect password');
    }
  };

  const copyContent = async () => {
    await navigator.clipboard.writeText(share.content);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-card border border-border p-8 text-center space-y-5">
          <div className="h-14 w-14 rounded-full gradient-hero flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Password Protected</h1>
          <p className="text-sm text-muted-foreground">
            Enter the password to view this share
          </p>
          <form onSubmit={handleUnlock} className="space-y-3">
            <Input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setIncorrect(false);
              }}
              autoFocus
              className={incorrect ? 'border-destructive' : ''}
            />
            {incorrect && (
              <p className="text-xs text-destructive">Incorrect password</p>
            )}
            <Button type="submit" className="w-full gradient-hero border-0 text-primary-foreground font-semibold">
              Unlock
            </Button>
          </form>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
          </Button>
        </Link>

        <div className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Created{' '}
              {new Date(share.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {share.password && (
              <span className="flex items-center gap-1 text-xs text-amber-500">
                <Lock className="h-3 w-3" /> Protected
              </span>
            )}
          </div>

          <div className="bg-muted/50 rounded-xl p-5 min-h-[120px]">
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
              {share.content}
            </p>
          </div>

          <Button
            onClick={copyContent}
            className="w-full gradient-hero border-0 text-primary-foreground font-semibold h-11"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" /> Copy Content
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
