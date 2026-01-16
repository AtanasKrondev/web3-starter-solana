'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={className}
        >
          {copied ? (
            <Icons.check className="size-4" />
          ) : (
            <Icons.copy className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {copied ? 'Copied to clipboard' : 'Copy to clipboard'}
      </TooltipContent>
    </Tooltip>
  );
}
