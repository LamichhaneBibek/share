'use client';

import { useState } from 'react';
import { Clipboard, Lock, Clock } from 'lucide-react';
import { ShareForm } from '@/components/share-form';
import { SharesList } from '@/components/shares-list';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/copy-button';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [newShareUrl, setNewShareUrl] = useState<string | null>(null);

  const handleShare = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNewShare = (url: string) => {
    setNewShareUrl(url);
    handleShare();
  };

  return (
    <main className="min-h-screen bg-background">
      {/* optionally show full-width share URL above everything */}
      {newShareUrl && (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Card className="w-full p-4 border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Share this link:
            </p>
            <div className="flex items-center gap-2 w-full">
              <Input
                value={newShareUrl}
                readOnly
                className="flex-1 min-w-0 max-w-full text-sm font-mono"
                onFocus={(e) => (e.target as HTMLInputElement).select()}
              />
              <div className="flex-shrink-0">
                <CopyButton content={newShareUrl} label="Copy" />
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setNewShareUrl(null)}
            >
              Share Another
            </Button>
          </Card>
        </div>
      )}
      {/* Hero section */}
      <div className="w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h1 className="text-5xl font-extrabold leading-tight">
            Share & Paste
          </h1>
          <p className="mt-4 text-lg sm:text-xl max-w-2xl mx-auto">
            Quickly share links and text with short, secure URLs. No signup
            required — everything is tied to your private session.
          </p>
          <p className="mt-6 text-sm opacity-90">
            Works on desktop and mobile, and keeps your data private within your
            browser session.
          </p>
            {/* quick feature list */}
            <div className="mt-8 grid gap-6 sm:grid-cols-3 text-center text-white/90">
              <div className="flex flex-col items-center">
                <Clipboard className="w-6 h-6 mb-2" />
                <span className="text-sm">Instant sharing</span>
              </div>
              <div className="flex flex-col items-center">
                <Lock className="w-6 h-6 mb-2" />
                <span className="text-sm">Session‑private</span>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="w-6 h-6 mb-2" />
                <span className="text-sm">No signup</span>
              </div>
            </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-1">
              <Card className="w-full p-6 border-border shadow-lg">
                <ShareForm onShare={handleNewShare} />
            </Card>
          </div>

          {/* Shares List Section */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-border shadow-lg">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Your Recent Shares
              </h2>
              <SharesList refreshTrigger={refreshTrigger} />
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Your session is secure and private. Shares are unique to your
            session.
          </p>
        </div>
      </div>
    </main>
  );
}
