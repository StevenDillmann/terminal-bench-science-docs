'use client';

import { QuoteDownIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { ApaBlock, BibtexBlock } from '@/components/copy-bibtex';
import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CITATION_DOI_URL, CITATION_REPO_URL } from '@/lib/citation';

/** Hero button that opens the BibTeX dialog. */
export function CiteButton() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className={buttonVariants({ variant: 'secondary', size: 'lg' })}
          />
        }
      >
        Cite the benchmark
        <HugeiconsIcon icon={QuoteDownIcon} strokeWidth={2} />
      </DialogTrigger>
        <DialogContent className="sm:max-w-[min(62rem,calc(100vw-2rem))]">
          <DialogHeader>
            <DialogTitle>Cite Terminal-Bench-Science</DialogTitle>
            <DialogDescription>
              One entry covers every release. The DOI resolves to the latest
              version on{' '}
              <a
                href={CITATION_DOI_URL}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                Zenodo
              </a>
              ; the source lives on{' '}
              <a
                href={CITATION_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                GitHub
              </a>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                APA
              </span>
              <ApaBlock />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                BibTeX
              </span>
              <BibtexBlock />
            </div>
          </div>
        </DialogContent>
    </Dialog>
  );
}
