'use client';

import { motion } from 'motion/react';

const DIGITS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] as const;
const ZENODO_DOI = 'https://doi.org/10.5281/zenodo.22110253';

function offsetFor(digit: number) {
  return `${-(9 - digit)}em`;
}

function DigitReel({ from, to }: { from: number; to: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden">
      <span aria-hidden className="invisible">
        0
      </span>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col will-change-transform"
        initial={{ y: offsetFor(from) }}
        animate={{ y: offsetFor(to) }}
        transition={{
          type: 'spring',
          stiffness: 90,
          damping: 8,
          mass: 1.1,
          delay: 0.08,
        }}
      >
        {DIGITS.map((digit) => (
          <span
            key={digit}
            className="block h-[1em] w-[1ch] text-center leading-[1em]"
          >
            {digit}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function HeroTitle() {
  return (
    <h1 className="max-w-full whitespace-nowrap px-1 text-center text-[clamp(1.125rem,7vw,2.125rem)] font-normal tracking-tighter uppercase sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-none">
      TERMINAL-BENCH-
      <span>SCIENCE</span>{' '}
      <a
        href={ZENODO_DOI}
        target="_blank"
        rel="noreferrer"
        aria-label="View Terminal-Bench-Science version 0.1 on Zenodo"
        className="inline-flex items-baseline tabular-nums text-inherit no-underline transition-opacity hover:opacity-80 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#038f99]"
      >
        0.<DigitReel from={0} to={1} />
      </a>
    </h1>
  );
}
