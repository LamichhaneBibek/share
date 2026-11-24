'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Copy, Check, ArrowLeft, Lock, Download, FileText } from 'lucide-react';
import { TopNav } from '@/components/pasteglass/top-nav';
import { toast } from 'sonner';
import { CodeViewer } from '@/components/code-viewer';
import { languageLabel, languageExt } from '@/lib/languages';
import { parseDbDate } from '@/lib/dates';

interface SharedItem {
  id: string;
  slug: string;
  content: string;
  title: string | null;
  language: string;
  password: string | null;
  is_public: number;
  expires_at: string | null;
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
  const [shaking, setShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadShare = async () => {
      try {
        const response = await fetch(`/api/shares/${slug}`);
        if (!response.ok) {
          if (response.status === 404 || response.status === 410) {
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
      <Shell>
        <p className="py-24 text-center font-mono text-sm text-muted-foreground">Loading /{slug}…</p>
      </Shell>
    );
  }

  if (notFound || !share) {
    return (
      <Shell>
        <div className="max-w-md mx-auto py-24 text-center">
          <p className="font-mono text-sm text-muted-foreground mb-4">/{slug}</p>
          <h1 className="text-[28px] leading-tight font-medium text-foreground mb-2">Paste not found</h1>
          <p className="text-sm text-text-secondary mb-8">
            It doesn&apos;t exist, has expired or was deleted.
          </p>
          <BackLink />
        </div>
      </Shell>
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
      setShaking(true);
      setPasswordInput('');
      inputRef.current?.focus();
      setTimeout(() => setShaking(false), 500);
    }
  };

  const copyContent = async () => {
    await navigator.clipboard.writeText(share.content);
    setCopied(true);
    toast.success('Content copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadContent = () => {
    const blob = new Blob([share.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${share.title?.trim() || share.slug}.${languageExt(share.language)}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openRaw = () => {
    const params = share.password && unlocked ? `?password=${encodeURIComponent(share.password)}` : '';
    window.open(`/raw/${share.slug}${params}`, '_blank');
  };

  if (needsPassword) {
    return (
      <Shell>
        <div className="max-w-sm mx-auto py-24">
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="h-10 w-10 mb-6 rounded-lg bg-muted flex items-center justify-center text-text-secondary">
              <Lock className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-medium text-foreground mb-1">Password required</h1>
            <p className="text-sm text-text-secondary mb-6">
              <span className="font-mono text-foreground/80">/{share.slug}</span> is protected. Enter
              the password to open it.
            </p>

            <form onSubmit={handleUnlock}>
              <label htmlFor="unlock-password" className="block text-sm text-text-secondary mb-2">
                Password
              </label>
              <div className={shaking ? 'shake' : ''}>
                <input
                  id="unlock-password"
                  ref={inputRef}
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setIncorrect(false);
                  }}
                  autoFocus
                  aria-invalid={incorrect}
                  className={`field w-full h-10 px-3 rounded-lg text-sm ${
                    incorrect ? 'border-destructive' : ''
                  }`}
                />
              </div>
              <p className="h-6 pt-1 text-xs text-destructive" aria-live="polite">
                {incorrect ? 'Wrong password, try again' : ''}
              </p>
              <button
                type="submit"
                className="w-full h-10 mt-2 rounded-lg bg-signal text-signal-foreground text-sm font-medium hover:bg-[#f4b84d] active:scale-[0.98] transition-[background-color,transform] duration-150"
              >
                Unlock
              </button>
            </form>
          </div>
          <div className="mt-6 text-center">
            <BackLink />
          </div>
        </div>
      </Shell>
    );
  }

  const fmtDate = (d: string, withTime = false) =>
    parseDbDate(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
    });

  const secondaryButton =
    'h-10 px-4 rounded-lg border border-input bg-card text-sm text-foreground flex items-center gap-2 hover:bg-muted transition-colors duration-150';

  return (
    <Shell>
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-6">
          <BackLink />
        </div>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div className="min-w-0">
            <h1 className="text-[28px] leading-tight font-medium text-foreground break-words mb-2">
              {share.title?.trim() || 'Untitled paste'}
            </h1>
            <p className="font-mono text-xs text-muted-foreground tabular-nums flex flex-wrap gap-x-2 gap-y-1">
              <span className="text-foreground/80">/{share.slug}</span>
              <span aria-hidden>·</span>
              <span>{languageLabel(share.language)}</span>
              <span aria-hidden>·</span>
              <span>Created {fmtDate(share.created_at, true)}</span>
              {share.expires_at && (
                <>
                  <span aria-hidden>·</span>
                  <span>Expires {fmtDate(share.expires_at)}</span>
                </>
              )}
              <span aria-hidden>·</span>
              <span>{share.is_public === 1 ? 'Public' : 'Unlisted'}</span>
              {share.password && (
                <>
                  <span aria-hidden>·</span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3" strokeWidth={1.5} /> Protected
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-none">
            <button onClick={openRaw} className={secondaryButton} title="View raw">
              <FileText className="h-4 w-4" strokeWidth={1.5} /> Raw
            </button>
            <button onClick={downloadContent} className={secondaryButton} title="Download">
              <Download className="h-4 w-4" strokeWidth={1.5} /> Download
            </button>
            <button
              onClick={copyContent}
              className="h-10 w-28 px-4 rounded-lg bg-signal text-signal-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#f4b84d] active:scale-[0.98] transition-[background-color,transform] duration-150"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={1.5} /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" strokeWidth={1.5} /> Copy
                </>
              )}
            </button>
          </div>
        </header>

        <CodeViewer content={share.content} language={share.language} />
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="px-4 md:px-8">{children}</main>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 h-8 px-2 -ml-2 rounded-md text-sm text-text-secondary hover:text-foreground hover:bg-muted transition-colors duration-150"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> New paste
    </Link>
  );
}
