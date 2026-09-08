"use client";

import { ArrowUpRight, Terminal } from "lucide-react";
import Link from "next/link";

import { useHomeBenchmark } from "@/components/leaderboard/benchmark-select";
import { buttonVariants } from "@/components/ui/button";
import { domainTasksUrl } from "@/lib/domain-context";
import { DEFAULT_HOME_BENCHMARK_ID } from "@/lib/leaderboard";

/** Hero button: the full task list on Harbor Hub. */
export function ViewTasksLink() {
  return (
    <a
      href={domainTasksUrl("all")}
      target="_blank"
      rel="noreferrer"
      className={buttonVariants({ variant: "secondary", size: "lg" })}
    >
      View the tasks
      <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden />
    </a>
  );
}

function runHref(benchmarkId: string): string {
  return benchmarkId === DEFAULT_HOME_BENCHMARK_ID
    ? "/run"
    : `/run?version=${encodeURIComponent(benchmarkId)}`;
}

function RunLinkView({ benchmarkId }: { benchmarkId: string }) {
  return (
    <Link
      href={runHref(benchmarkId)}
      className={buttonVariants({ variant: "secondary", size: "lg" })}
    >
      Run the benchmark
      <Terminal className="size-4" strokeWidth={2} aria-hidden />
    </Link>
  );
}

/** Hero "Run the benchmark" link that carries the selected version to /run. */
export function RunBenchmarkLink() {
  const { benchmark } = useHomeBenchmark();
  return <RunLinkView benchmarkId={benchmark.id} />;
}

export function RunBenchmarkLinkFallback() {
  return <RunLinkView benchmarkId={DEFAULT_HOME_BENCHMARK_ID} />;
}
