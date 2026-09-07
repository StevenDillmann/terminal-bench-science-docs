'use client';

import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CITATION_APA, CITATION_BIBTEX } from '@/lib/citation';
import { cn } from '@/lib/utils';

/** Copyable citation text; shared by the dialog and MDX pages. */
function CopyableBlock({
  text,
  label,
  mono = true,
  className,
}: {
  text: string;
  label: string;
  mono?: boolean;
  className?: string;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('error');
    }
    window.setTimeout(() => setState('idle'), 1600);
  }

  return (
    <div
      className={cn(
        'relative w-full min-w-0 max-w-full rounded-lg border bg-muted/40 text-[12.5px] leading-relaxed',
        mono ? 'font-mono' : 'font-sans text-[13px]',
        className,
      )}
    >
      <pre
        className={cn(
          'm-0 max-w-full overflow-x-auto rounded-none border-0 bg-transparent p-4 pr-20 text-inherit shadow-none',
          mono ? 'whitespace-pre' : 'whitespace-pre-wrap font-sans',
        )}
      >
        <code className="border-0 bg-transparent p-0 font-inherit text-inherit">
          {text}
        </code>
      </pre>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={`Copy ${label}`}
        className="absolute top-2.5 right-2.5 h-7 gap-1.5 px-2 text-xs"
        onClick={() => void copy()}
      >
        <HugeiconsIcon
          icon={state === 'copied' ? Tick02Icon : Copy01Icon}
          strokeWidth={2}
          className={cn('size-3.5', state === 'error' && 'text-destructive')}
        />
        {state === 'copied' ? 'Copied' : state === 'error' ? 'Failed' : 'Copy'}
      </Button>
    </div>
  );
}

export function BibtexBlock({ className }: { className?: string }) {
  return (
    <CopyableBlock text={CITATION_BIBTEX} label="BibTeX" className={className} />
  );
}

export function ApaBlock({ className }: { className?: string }) {
  return (
    <CopyableBlock
      text={CITATION_APA}
      label="APA citation"
      mono={false}
      className={className}
    />
  );
}
