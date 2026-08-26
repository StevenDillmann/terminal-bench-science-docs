import { ContributorsGrid } from '@/components/contributors-grid';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';

import { cn } from '@/lib/utils';

const researchPartners = [
  ['Laude Institute', 'https://laude.org/'],
  ['Stanford AI Lab (SAIL)', 'https://ai.stanford.edu/'],
  [
    'Stanford Institute for Human-Centered Artificial Intelligence (HAI)',
    'https://hai.stanford.edu/',
  ],
  ['Stanford AI Measurement Science (AIMS)', 'https://aimslab.stanford.edu/'],
  ['2077AI Open Source Foundation', 'https://www.2077ai.com/'],
  [
    'NSF AI Institute for Foundations of Machine Learning (IFML)',
    'https://www.ifml.institute/',
  ],
  ['Allen Institute', 'https://alleninstitute.org/'],
  ['Allen Institute for AI (Ai2)', 'https://allenai.org/'],
] as const;

const industrySponsors = [
  ['Anthropic', 'https://www.anthropic.com/'],
  ['Bespoke Labs', 'https://bespokelabs.ai/'],
  ['Google', 'https://www.google.com/'],
  ['Modal', 'https://modal.com/'],
  ['Snorkel AI', 'https://snorkel.ai/'],
  ['SpaceXAI', 'https://x.ai/'],
  ['UniPat AI', 'https://unipat.ai/'],
  ['Z.ai', 'https://z.ai/'],
] as const;

function OrganizationLinks({
  organizations,
}: {
  organizations: readonly (readonly [string, string])[];
}) {
  return (
    <p className="text-sm leading-7 text-muted-foreground">
      {organizations.map(([name, href], index) => (
        <span key={name}>
          <a href={href} target="_blank" rel="noreferrer">
            {name}
          </a>
          {index < organizations.length - 1 ? ', ' : ''}
        </span>
      ))}
    </p>
  );
}

export const metadata: Metadata = {
  title: 'Contributors',
  description: 'People and organizations behind Terminal-Bench-Science.',
};

export default function ContributorsPage() {
  return (
    <article
      className={cn(
        'content-page mx-auto w-full max-w-4xl flex-1 px-4 py-12',
        GeistSans.className,
      )}
    >
      <h1>Contributors</h1>
      <p className="mb-10 text-muted-foreground">
        The people and organizations behind Terminal-Bench-Science.
      </p>
      <ContributorsGrid />
      <section className="mt-12">
        <h2>Research Partners</h2>
        <OrganizationLinks organizations={researchPartners} />
      </section>
      <section className="mt-8">
        <h2>Industry Sponsors</h2>
        <OrganizationLinks organizations={industrySponsors} />
      </section>
    </article>
  );
}
