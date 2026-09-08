import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { HeroTitle } from "@/components/hero-title";
import { CiteButton } from "@/components/cite-dialog";
import { renderHighlightItems } from "@/components/highlights/render-highlights";
import { HomeView } from "@/components/home-view";
import {
  RunBenchmarkLink,
  RunBenchmarkLinkFallback,
  ViewTasksLink,
} from "@/components/task-actions";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  // Highlights are hidden until the first real (non-example) entry lands.
  const highlights = renderHighlightItems().filter((item) => !item.example);
  return (
    <div className="flex w-full min-w-0 flex-1 flex-col pt-12">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-8">
        <div className="mx-auto flex w-full max-w-8xl flex-col items-center gap-8 px-4 text-center">
          <div className="flex flex-col items-center gap-6">
            <HeroTitle />
            <p className="max-w-none text-lg font-normal tracking-tighter text-muted-foreground md:whitespace-nowrap">
              A benchmark for evaluating AI agents on research workflows across
              scientific domains
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Suspense fallback={<RunBenchmarkLinkFallback />}>
              <RunBenchmarkLink />
            </Suspense>
            <ViewTasksLink />
            <Link
              href="/contribute"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              Contribute a task
              <Plus className="size-4" strokeWidth={2} aria-hidden />
            </Link>
            <CiteButton />
          </div>
        </div>

        <div className="w-full min-w-0 px-4 md:px-8">
          <Suspense
            fallback={
              <div className="min-h-96 rounded-xl border bg-card" aria-hidden />
            }
          >
            <HomeView highlights={highlights} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
