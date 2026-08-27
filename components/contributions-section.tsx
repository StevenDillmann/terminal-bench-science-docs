import { ProposalFunnel } from '@/components/charts/proposal-funnel';
import { ContributorGeographyMap } from '@/components/contributor-geography-map';

const SECTION_TITLE = 'Terminal-Bench-Science 0.1 Contributions';
const TITLE_MARGIN = 8;

export function ContributionsSection() {
  return (
    <div className="not-prose">
      <div className="mb-1 mt-6 flex items-center">
        <p
          className="min-w-0 whitespace-nowrap text-sm uppercase text-muted-foreground"
          style={{ paddingLeft: TITLE_MARGIN }}
        >
          {SECTION_TITLE}
        </p>
      </div>
      <ProposalFunnel />
      <ContributorGeographyMap />
    </div>
  );
}
