'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, ArrowLeft, Lock, ShieldAlert, Globe, EyeOff, Clock, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface SharedItem {
  id: string;
  slug: string;
  content: string;
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

  // Derive a unique hue from the slug so every lock screen has its own accent color
  const slugHue = slug
    ? slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
    : 260;

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
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (needsPassword) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4"
           style={{ background: `oklch(0.08 0.02 ${slugHue})` }}>

        {/* Blurred content ghost — hints that something is hidden */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-start justify-center p-16 pointer-events-none select-none overflow-hidden"
        >
          <p
            className="text-4xl font-bold leading-relaxed text-center break-words whitespace-pre-wrap opacity-100"
            style={{
              color: `oklch(0.85 0.08 ${slugHue})`,
              filter: 'blur(18px)',
              transform: 'scale(1.08)',
              transformOrigin: 'top center',
            }}
          >
            {share.content}
          </p>
        </div>

        {/* Radial vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 0%, oklch(0.08 0.02 ${slugHue} / 0.7) 60%, oklch(0.05 0.02 ${slugHue}) 100%)`,
          }}
        />

        {/* Frosted glass card */}
        <div
          className="relative w-full max-w-sm rounded-2xl border p-8 text-center space-y-6"
          style={{
            background: 'oklch(1 0 0 / 0.06)',
            backdropFilter: 'blur(24px)',
            borderColor: `oklch(0.85 0.06 ${slugHue} / 0.2)`,
            boxShadow: `0 0 60px oklch(0.6 0.2 ${slugHue} / 0.15), 0 24px 48px rgb(0 0 0 / 0.4)`,
          }}
        >
          {/* Animated lock icon */}
          <div className="relative mx-auto w-fit">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center"
              style={{ background: `oklch(0.65 0.22 ${slugHue})` }}
            >
              <Lock className="h-7 w-7 text-white" />
            </div>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ background: `oklch(0.65 0.22 ${slugHue})` }}
            />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-white">Protected Content</h1>
            <p className="text-sm" style={{ color: `oklch(0.8 0.04 ${slugHue})` }}>
              Enter the password to reveal this share
            </p>
          </div>

          {/* Visual lock dots — decorative, not tied to real password length */}
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full"
                style={{
                  background: incorrect
                    ? 'oklch(0.65 0.22 25)'
                    : `oklch(0.65 0.22 ${slugHue} / ${0.25 + i * 0.15})`,
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div className={shaking ? 'shake' : ''}>
              <Input
                ref={inputRef}
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setIncorrect(false);
                }}
                autoFocus
                className="text-center tracking-[0.3em] bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/50 focus-visible:ring-0"
              />
            </div>

            {incorrect && (
              <p className="text-xs text-red-400 font-medium">Wrong password — try again</p>
            )}

            <Button
              type="submit"
              className="w-full font-semibold border-0 text-white"
              style={{ background: `oklch(0.65 0.22 ${slugHue})` }}
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Unlock
            </Button>
          </form>

          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">
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
          <div className="flex items-center justify-between flex-wrap gap-2">
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
            <div className="flex items-center gap-2">
              {share.expires_at && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Expires {new Date(share.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              {share.is_public === 1 ? (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Globe className="h-3 w-3" /> Public
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <EyeOff className="h-3 w-3" /> Unlisted
                </span>
              )}
              {share.password && (
                <span className="flex items-center gap-1 text-xs text-amber-500">
                  <Lock className="h-3 w-3" /> Protected
                </span>
              )}
            </div>
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
