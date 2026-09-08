import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { HighlightsGrid } from "@/components/highlights/highlights-grid";
import { renderHighlightItems } from "@/components/highlights/render-highlights";
import { DomainToggle } from "@/components/home-view-toggle";
import { HUB_TASKS_URL } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Research Highlights",
  description:
    "Featured Terminal-Bench-Science tasks, with the scientific context behind them in the authors’ own words.",
};

export default function HighlightsPage() {
  // Unpublished until the first real highlight exists; examples alone 404.
  const items = renderHighlightItems();
  if (!items.some((item) => !item.example)) notFound();

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-8 px-4 pt-12 pb-16 md:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-normal tracking-tighter uppercase sm:text-5xl">
          Research Highlights
        </h1>
        <p className="max-w-2xl text-lg tracking-tight text-muted-foreground">
          Featured tasks and the science behind them, in the authors&rsquo; own
          words. Every card links to the task on GitHub; the full set of tasks
          is on{" "}
          <a
            href={HUB_TASKS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-baseline gap-0.5 text-foreground underline underline-offset-4"
          >
            Harbor Hub
            <ArrowUpRight
              className="size-3.5 self-center"
              strokeWidth={2}
              aria-hidden
            />
          </a>
          .
        </p>
      </div>
      <Suspense fallback={null}>
        <div className="flex w-full justify-center">
          <DomainToggle />
        </div>
        <HighlightsGrid items={items} />
      </Suspense>
    </div>
  );
}
