import { ApaBlock, BibtexBlock } from '@/components/copy-bibtex';
import { CITATION_DOI, CITATION_DOI_URL } from '@/lib/citation';

/** "How to cite" block for MDX pages. */
export function HowToCite() {
  return (
    <div className="not-prose my-6 flex w-full min-w-0 flex-col gap-3">
      <p className="m-0 text-sm text-muted-foreground">
        If Terminal-Bench-Science is useful in your work, please cite it. One
        entry covers every release; the DOI{' '}
        <a
          href={CITATION_DOI_URL}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-foreground underline underline-offset-4"
        >
          {CITATION_DOI}
        </a>{' '}
        always resolves to the latest version.
      </p>
      <span className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        APA
      </span>
      <ApaBlock />
      <span className="mt-2 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        BibTeX
      </span>
      <BibtexBlock />
    </div>
  );
}
