'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  content: string;
  label?: string;
}

export function CopyButton({ content, label = 'Copy to Clipboard' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
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

  return (
    <Button
      onClick={handleCopy}
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
          {label}
        </>
      )}
    </Button>
  );
}
