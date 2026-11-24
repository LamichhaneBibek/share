'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Copy, Globe, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { LANGUAGES, EXPIRY_OPTIONS, DEFAULT_EXPIRY, languageLabel } from '@/lib/languages';

const DRAFT_KEY = 'pasteglass-draft';

interface PasteEditorProps {
  onShareCreated: (slug: string) => void;
}

export function PasteEditor({ onShareCreated }: PasteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [expiresIn, setExpiresIn] = useState<string>(DEFAULT_EXPIRY);
  const [password, setPassword] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Restore draft on mount, persist on change
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.content) setContent(parsed.content);
      }
    } catch {
      // ignore corrupt drafts
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (title || content) {
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content }));
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        // storage full or unavailable
      }
    }, 400);
    return () => clearTimeout(id);
  }, [title, content]);

  const copyContent = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    toast.success('Content copied');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Add some content first');
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
      toast.success('Paste published');
      onShareCreated(item.slug);
      setTitle('');
      setContent('');
      setLanguage('plaintext');
      setExpiresIn(DEFAULT_EXPIRY);
      setPassword('');
      setIsPublic(false);
      localStorage.removeItem(DRAFT_KEY);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create paste');
    } finally {
      setLoading(false);
    }
  };

  const lines = content ? content.split('\n').length : 1;
  const chars = content.length;
  const expiryLabel = EXPIRY_OPTIONS.find((o) => o.value === expiresIn)?.label ?? '';

  const syncGutter = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.style.transform = `translateY(-${e.currentTarget.scrollTop}px)`;
    }
  };

  const labelClass = 'block text-sm text-text-secondary mb-2';
  const segment = (active: boolean) =>
    `flex-1 h-8 rounded-md text-sm flex items-center justify-center gap-2 transition-colors duration-150 ${
      active
        ? 'bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:bg-[#232838]'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8" id="paste-editor">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-[28px] leading-tight font-medium text-foreground">New paste</h1>
        <span className="hidden sm:flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Check className="h-4 w-4" strokeWidth={1.5} />
          Draft saved locally
        </span>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
          <div>
            <label htmlFor="paste-title" className={labelClass}>Title</label>
            <input
              id="paste-title"
              className="field w-full h-10 px-3 rounded-lg text-sm"
              placeholder="nginx.conf for staging"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="paste-language" className={labelClass}>Language</label>
            <div className="relative">
              <select
                id="paste-language"
                className="field w-full h-10 pl-3 pr-9 rounded-lg text-sm appearance-none cursor-pointer"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Editor: gutter, text, status bar */}
        <div className="rounded-xl border border-input overflow-hidden focus-within:border-signal-ink focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--signal)_18%,transparent)] transition-[border-color,box-shadow] duration-150">
          <div className="flex h-[360px] bg-background">
            <div
              aria-hidden
              className="w-12 flex-none overflow-hidden bg-gutter border-r border-border select-none"
            >
              <div ref={gutterRef} className="py-4 pr-3 text-right font-mono text-[13px] leading-6 text-muted-foreground/70">
                {Array.from({ length: lines }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            </div>
            <textarea
              ref={textareaRef}
              aria-label="Content"
              className="thin-scroll flex-1 bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-foreground placeholder:text-muted-foreground resize-none outline-none whitespace-pre"
              placeholder="Paste code or text"
              wrap="off"
              spellCheck={false}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onScroll={syncGutter}
            />
          </div>
          <div className="h-8 px-3 flex items-center justify-between gap-4 bg-gutter border-t border-border font-mono text-xs text-muted-foreground tabular-nums">
            <span className="truncate">
              {languageLabel(language)} · {lines.toLocaleString('en-US')} {lines === 1 ? 'line' : 'lines'} · {chars.toLocaleString('en-US')} chars · UTF-8
            </span>
            <span className="flex items-center gap-3 flex-none">
              <span className="hidden sm:inline">Expires in {expiryLabel}</span>
              <button
                type="button"
                onClick={copyContent}
                disabled={!content}
                className="flex items-center gap-1 hover:text-foreground disabled:opacity-50 disabled:hover:text-muted-foreground transition-colors duration-150"
                title="Copy content"
              >
                <Copy className="h-4 w-4" strokeWidth={1.5} />
                Copy
              </button>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className={labelClass}>Visibility</span>
            <div className="flex gap-1 p-1 h-10 bg-muted rounded-lg">
              <button type="button" onClick={() => setIsPublic(false)} className={segment(!isPublic)}>
                <Link2 className="h-4 w-4" strokeWidth={1.5} /> Unlisted
              </button>
              <button type="button" onClick={() => setIsPublic(true)} className={segment(isPublic)}>
                <Globe className="h-4 w-4" strokeWidth={1.5} /> Public
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="paste-expiry" className={labelClass}>Expires after</label>
            <div className="relative">
              <select
                id="paste-expiry"
                className="field w-full h-10 pl-3 pr-9 rounded-lg text-sm appearance-none cursor-pointer"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <label htmlFor="paste-password" className={labelClass}>
              Password <span className="text-muted-foreground">optional</span>
            </label>
            <input
              id="paste-password"
              type="password"
              autoComplete="new-password"
              className="field w-full h-10 px-3 rounded-lg text-sm"
              placeholder="None"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {isPublic ? 'Listed in the public feed' : 'Only people with the link can open it'}
            {password ? ', password required' : ''}
          </p>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="h-10 px-5 rounded-lg bg-signal text-signal-foreground text-sm font-medium hover:bg-[#f4b84d] active:scale-[0.98] transition-[background-color,transform,opacity] duration-150 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? 'Publishing…' : 'Publish paste'}
          </button>
        </div>
      </form>
    </div>
  );
}
