"use client";

import { useQueryState } from "nuqs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

import { DomainRadarView } from "@/components/charts/domain-radar-view";
import { ParetoView } from "@/components/charts/pareto-view";
import {
  DomainToggle,
  parseHomeView,
  type HomeViewId,
} from "@/components/home-view-toggle";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import {
  HighlightsGrid,
  type HighlightItem,
} from "@/components/highlights/highlights-grid";
import { MatrixView } from "@/components/matrix-view";
import { parseHomeDomain, type DomainId } from "@/lib/domain-context";

function ViewContent({ view, domain }: { view: HomeViewId; domain: DomainId }) {
  switch (view) {
    case "leaderboard":
      return <LeaderboardTable domain={domain} />;
    case "pareto":
      return <ParetoView domain={domain} />;
    case "domains":
      return <DomainRadarView domain={domain} />;
    case "matrix":
      return <MatrixView domain={domain} />;
    default: {
      const _exhaustive: never = view;
      return _exhaustive;
    }
  }
}

function DomainSelector() {
  return (
    <div className="flex w-full min-w-0 items-center justify-center">
      <DomainToggle className="self-center" />
    </div>
  );
}

export function HomeView({ highlights }: { highlights: HighlightItem[] }) {
  const [view] = useQueryState("view", parseHomeView);
  const [domain, setDomain] = useQueryState("domain", parseHomeDomain);

  useEffect(() => {
    if (view === "domains" && domain !== "all") {
      void setDomain("all");
    }
  }, [domain, setDomain, view]);

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-6">
      <section className="flex w-full min-w-0 flex-col gap-8">
        <DomainSelector />
        <ViewContent view={view} domain={domain} />
      </section>
      {highlights.length > 0 ? (
        <section className="flex w-full min-w-0 flex-col gap-4 pt-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-medium tracking-[0.08em] text-muted-foreground uppercase">
              Research highlights
            </h2>
            <Link
              href="/highlights"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              See all
              <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden />
            </Link>
          </div>
          <HighlightsGrid
            items={highlights}
            limit={3}
            emptyText="No highlights for this domain yet. Authors can add one with a pull request."
          />
        </section>
      ) : null}
    </div>
  );
}
