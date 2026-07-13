'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, CloudUpload, Copy, Globe, Lock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { LANGUAGES, EXPIRY_OPTIONS, DEFAULT_EXPIRY } from '@/lib/languages';

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
    toast.success('Content copied!');
  };

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
      localStorage.removeItem(DRAFT_KEY);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create paste');
    } finally {
      setLoading(false);
    }
  };

  const lines = content ? content.split('\n').length : 0;
  const chars = content.length;

  const labelClass =
    'text-xs font-semibold uppercase tracking-wider text-pg-outline dark:text-pg-outline-variant';

  return (
    <div className="glass-panel p-6 md:p-8 rounded-xl shadow-lg" id="paste-editor">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-pg-primary dark:text-pg-primary-soft mb-2 block">
            New Fragment
          </span>
          <h1 className="text-2xl md:text-[32px] font-bold tracking-tight text-pg-ink dark:text-pg-paper leading-tight">
            Create New Paste
          </h1>
        </div>
        <span className="hidden sm:flex px-3 py-1 bg-pg-primary/10 dark:bg-white/10 text-pg-primary dark:text-pg-primary-soft rounded text-xs font-bold uppercase items-center gap-1">
          <CloudUpload className="h-3.5 w-3.5" /> Draft saved locally
        </span>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>Paste Title</label>
            <input
              className="w-full glass-input px-4 py-3 rounded-lg dark:text-pg-paper"
              placeholder="e.g. Production Nginx Config"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Syntax Highlighting</label>
            <div className="relative">
              <select
                className="w-full glass-input px-4 py-3 rounded-lg appearance-none cursor-pointer dark:text-pg-paper"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pg-outline pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className={labelClass}>Content</label>
            <button
              type="button"
              onClick={copyContent}
              className="p-1.5 text-pg-outline hover:text-pg-primary transition-colors"
              title="Copy content"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
          <div className="relative group">
            <textarea
              ref={textareaRef}
              className="w-full glass-input px-4 py-4 rounded-lg font-mono text-sm resize-none leading-relaxed min-h-[320px] dark:text-pg-paper"
              placeholder="// Paste your code or text here..."
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 text-pg-outline-variant font-mono text-xs pointer-events-none opacity-60">
              UTF-8 | {lines} lines | {chars} chars
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>Visibility</label>
            <div className="flex bg-white/50 dark:bg-white/5 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${
                  isPublic
                    ? 'bg-white dark:bg-pg-primary/40 shadow-sm text-pg-primary dark:text-white'
                    : 'text-pg-ink-soft dark:text-pg-outline-variant hover:bg-white/50 dark:hover:bg-white/10'
                }`}
              >
                <Globe className="h-4 w-4" /> Public
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${
                  !isPublic
                    ? 'bg-white dark:bg-pg-primary/40 shadow-sm text-pg-primary dark:text-white'
                    : 'text-pg-ink-soft dark:text-pg-outline-variant hover:bg-white/50 dark:hover:bg-white/10'
                }`}
              >
                <Lock className="h-4 w-4" /> Unlisted
              </button>
            </div>
            <p className="text-xs text-pg-outline dark:text-pg-outline-variant">
              {isPublic ? 'Visible in the public feed' : 'Only accessible via direct link'}
            </p>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Expiration</label>
            <div className="relative">
              <select
                className="w-full glass-input px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer dark:text-pg-paper"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pg-outline pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <label className={`${labelClass} flex items-center gap-1.5`}>
              <Lock className="h-3.5 w-3.5" />
              Password <span className="normal-case font-normal tracking-normal">(optional)</span>
            </label>
            <input
              type="password"
              className="w-full glass-input px-4 py-2.5 rounded-lg text-sm dark:text-pg-paper"
              placeholder="Set a password for protection"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full h-[46px] primary-gradient text-white rounded-lg font-bold text-lg shadow-lg shadow-pg-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send className="h-5 w-5" />
            {loading ? 'Publishing...' : 'Publish Paste'}
          </button>
        </div>
      </form>
    </div>
  );
}
