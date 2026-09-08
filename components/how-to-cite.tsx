import { ApaBlock, BibtexBlock } from "@/components/copy-bibtex";
import {
  CITATION_DOI,
  CITATION_DOI_URL,
  CITATION_ZENODO_URL,
} from "@/lib/citation";

/**
 * "Citation" section body for MDX pages; identical on every page that cites.
 * The paragraph is ordinary prose so it inherits the article's text styling.
 */
export function HowToCite() {
  return (
    <>
      <p>
        If you find this work useful, please cite it. The DOI{" "}
        <a href={CITATION_DOI_URL} target="_blank" rel="noreferrer">
          {CITATION_DOI}
        </a>{" "}
        is the concept DOI and always resolves to the latest release; to cite
        a specific release, use that version&rsquo;s DOI from the{" "}
        <a href={CITATION_ZENODO_URL} target="_blank" rel="noreferrer">
          Zenodo record
        </a>
        .
      </p>
      <div className="not-prose my-6 flex w-full min-w-0 flex-col gap-3">
        <span className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          APA
        </span>
        <ApaBlock />
        <span className="mt-2 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          BibTeX
        </span>
        <BibtexBlock />
      </div>
    </>
  );
}
