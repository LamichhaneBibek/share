'use client';

import { useState, useCallback, useEffect } from 'react';
import { Clipboard, Lock, Clock, Sparkles } from 'lucide-react';
import { ShareForm } from '@/components/share-form';
import { SharesList } from '@/components/shares-list';
import { getShares } from '@/lib/shares';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Home() {
  const [shares, setShares] = useState<any[]>([]);
  const [newShareUrl, setNewShareUrl] = useState<string | null>(null);

  // Use useEffect to prevent hydration issues with localStorage
  useEffect(() => {
    setShares(getShares());
  }, []);

  const refresh = useCallback(() => {
    setShares(getShares());
  }, []);

  const handleShareCreated = (slug: string) => {
    const url = `${window.location.origin}/share/${slug}`;
    setNewShareUrl(url);
    refresh();
  };

  const copyShareUrl = async () => {
    if (!newShareUrl) return;
    await navigator.clipboard.writeText(newShareUrl);
    toast.success('Link copied!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* New share URL banner */}
      {newShareUrl && (
        <div className="gradient-hero px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-primary-foreground flex-shrink-0" />
            <Input
              readOnly
              value={newShareUrl}
              className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60 text-sm h-9 flex-1"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={copyShareUrl}
              className="flex-shrink-0 font-semibold"
            >
              Copy
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setNewShareUrl(null)}
              className="text-primary-foreground hover:bg-primary-foreground/10 flex-shrink-0"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="gradient-hero py-16 pb-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground tracking-tight mb-4">
            Share & Paste
          </h1>
          <p className="text-primary-foreground/90 text-lg max-w-xl mx-auto mb-2">
            Quickly share links and text with short, secure URLs. No signup
            required — everything is tied to your private session.
          </p>
          <p className="text-primary-foreground/60 text-sm mb-8">
            Works on desktop and mobile. Your data stays private in your browser.
          </p>

          <div className="flex justify-center gap-10 text-primary-foreground/80">
            {[
              { icon: Clipboard, label: 'Instant sharing' },
              { icon: Lock, label: 'Session-private' },
              { icon: Clock, label: 'No signup' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 -mt-10">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
            <ShareForm onShareCreated={handleShareCreated} />
          </div>

          {/* Shares list */}
          <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Your Recent Shares
            </h2>
            <SharesList shares={shares} onDelete={refresh} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-10">
          <p className="text-xs text-muted-foreground">
            Your session is secure and private. Shares are unique to your session.
          </p>
        </footer>
      </main>
    </div>
  );
}
