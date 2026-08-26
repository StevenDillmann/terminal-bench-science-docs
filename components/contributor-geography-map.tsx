import Image from 'next/image';

export function ContributorGeographyMap() {
  return (
    <figure className="my-6 w-full not-prose">
      <Image
        src="/tb-science-contributor-geography.webp"
        alt="World map showing the geographic density of Terminal-Bench-Science proposal and implementation authors using public profile locations and affiliations"
        width={1280}
        height={550}
        className="block h-auto w-full dark:hidden"
      />
      <Image
        src="/tb-science-contributor-geography-dark.webp"
        alt="World map showing the geographic density of Terminal-Bench-Science proposal and implementation authors using public profile locations and affiliations"
        width={1280}
        height={550}
        className="hidden h-auto w-full dark:block"
      />
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        <a
          href="https://stevendillmann.github.io/tb-science-task-dashboard/?tab=proposals"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Terminal-Bench-Science Contributor Geography
        </a>
      </figcaption>
    </figure>
  );
}
