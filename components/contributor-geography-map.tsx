import Image from 'next/image';

import geographyStats from '../public/tb-science-contributor-geography.json';

function chartSubtitle(contributorCount: number) {
  return `${contributorCount} contributors across 22 countries from proposals, reviews, or pull requests`;
}

/**
 * Served as-is: the maps are lossless WebP with a transparent background, and
 * the image optimizer can re-encode them to JPEG, which drops the alpha channel.
 */
export function ContributorGeographyMap() {
  const subtitle = chartSubtitle(geographyStats.combined_unique_authors);

  return (
    <figure className="mb-6 mt-2 w-full not-prose">
      <Image
        src="/tb-science-contributor-geography.webp"
        alt="World map showing the geographic density of Terminal-Bench-Science proposal and implementation authors using public profile locations and affiliations"
        width={1280}
        height={550}
        className="block h-auto w-full dark:hidden"
        unoptimized
      />
      <Image
        src="/tb-science-contributor-geography-dark.webp"
        alt="World map showing the geographic density of Terminal-Bench-Science proposal and implementation authors using public profile locations and affiliations"
        width={1280}
        height={550}
        className="hidden h-auto w-full dark:block"
        unoptimized
      />
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        {subtitle}
      </figcaption>
    </figure>
  );
}
