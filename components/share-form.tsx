'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lock, Send, Globe, EyeOff, Code2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { LANGUAGES, EXPIRY_OPTIONS, DEFAULT_EXPIRY } from '@/lib/languages';

interface ShareFormProps {
  onShareCreated: (slug: string) => void;
}

export function ShareForm({ onShareCreated }: ShareFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [expiresIn, setExpiresIn] = useState<string>(DEFAULT_EXPIRY);
  const [password, setPassword] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter some content to paste');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title: title.trim() || undefined,
          language,
          expiresIn,
          password: password || undefined,
          isPublic,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create paste');
      }

      const item = await response.json();
      toast.success('Paste created!');
      onShareCreated(item.slug);
      setTitle('');
      setContent('');
      setLanguage('plaintext');
      setExpiresIn(DEFAULT_EXPIRY);
      setPassword('');
      setIsPublic(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create paste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Title <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          placeholder="Untitled paste"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="bg-muted/50 border-border focus:border-primary transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          What do you want to paste?
        </label>
        <Textarea
          placeholder="Paste your code, link or text here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[140px] resize-none bg-muted/50 border-border focus:border-primary transition-colors font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
            Syntax
          </label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full bg-muted/50 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Expires in
          </label>
          <Select value={expiresIn} onValueChange={setExpiresIn}>
            <SelectTrigger className="w-full bg-muted/50 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPIRY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          {isPublic ? (
            <Globe className="h-4 w-4 text-primary" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground leading-none">
              {isPublic ? 'Public' : 'Unlisted'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPublic ? 'Visible in public feed' : 'Only accessible via link'}
            </p>
          </div>
        </div>
        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          Password
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          type="password"
          placeholder="Set a password for protection"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-muted/50 border-border focus:border-primary transition-colors"
        />
        <p className="text-xs text-muted-foreground">
          If set, viewers must enter this code to access the content
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading || !content.trim()}
        className="w-full gradient-hero border-0 text-primary-foreground font-semibold h-11 text-sm tracking-wide"
      >
        <Send className="h-4 w-4 mr-2" />
        Create Paste
      </Button>
    </form>
  );
}
