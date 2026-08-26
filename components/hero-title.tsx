'use client';

import { motion } from 'motion/react';

const DIGITS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] as const;

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
    <div className="flex max-w-full flex-col items-center gap-3">
      <h1 className="max-w-full px-1 text-center text-pretty text-4xl font-normal tracking-tighter uppercase sm:text-5xl md:text-7xl">
        TERMINAL-BENCH-
        <span>SCIENCE</span>
      </h1>
      <a
        href="https://doi.org/10.5281/zenodo.22110253"
        target="_blank"
        rel="noreferrer"
        aria-label="View Terminal-Bench-Science version 0.1 on Zenodo"
        className="inline-flex h-[34px] cursor-pointer items-center gap-2.5 rounded-sm border border-[#038f99]/30 bg-[#038f99]/10 px-3.5 text-xs font-bold tracking-[0.14em] text-[#027b84] uppercase no-underline transition-[background-color,border-color,box-shadow] duration-200 hover:border-[#038f99]/70 hover:bg-[#038f99]/20 hover:shadow-[0_0_0_3px_rgba(3,143,153,0.10),0_0_18px_rgba(3,143,153,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#038f99] dark:bg-[#038f99]/15 dark:text-[#18a9b3] dark:hover:border-[#038f99]/70 dark:hover:bg-[#038f99]/25 dark:hover:shadow-[0_0_0_3px_rgba(3,143,153,0.12),0_0_20px_rgba(3,143,153,0.28)]"
      >
        Version
        <span className="inline-flex items-baseline font-bold leading-none tracking-normal tabular-nums">
          0.<DigitReel from={0} to={1} />
        </span>
      </a>
    </div>
  );
}
