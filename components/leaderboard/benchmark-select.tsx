'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEFAULT_HOME_BENCHMARK_ID,
  HOME_BENCHMARKS,
  homeBenchmarkById,
  type HomeBenchmark,
} from '@/lib/leaderboard';

const parseBenchmarkId = parseAsStringLiteral(
  HOME_BENCHMARKS.map((benchmark) => benchmark.id),
);

/** Selected homepage benchmark version, shared across views via ?version=. */
export function useHomeBenchmark(): {
  benchmark: HomeBenchmark;
  setBenchmarkId: (id: string) => void;
} {
  const [benchmarkId, setBenchmarkId] = useQueryState(
    'version',
    parseBenchmarkId.withDefault(DEFAULT_HOME_BENCHMARK_ID),
  );
  return {
    benchmark: homeBenchmarkById(benchmarkId),
    setBenchmarkId: (id: string) => void setBenchmarkId(id),
  };
}

/** Shared trigger look for the homepage select filters (matches tbench.ai). */
/** Same look as the Run page's version trigger: square, unfilled, tight. */
export const HOME_SELECT_TRIGGER_CLASS =
  'h-8 gap-1 rounded-none border border-input bg-transparent px-1.5 uppercase text-muted-foreground shadow-none transition-colors hover:text-foreground dark:bg-transparent dark:hover:bg-transparent [&_svg]:size-3.5';

export function BenchmarkSelect() {
  const { benchmark, setBenchmarkId } = useHomeBenchmark();

  return (
    <Select
      value={benchmark.id}
      onValueChange={(next) => {
        if (typeof next === 'string') setBenchmarkId(next);
      }}
    >
      <SelectTrigger className={HOME_SELECT_TRIGGER_CLASS} aria-label="Benchmark version">
        <SelectValue>{benchmark.id}</SelectValue>
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="min-w-(--anchor-width)"
      >
        {HOME_BENCHMARKS.map((option) => (
          <SelectItem key={option.id} value={option.id} className="uppercase">
            {option.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
