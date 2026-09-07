import { Plus, Terminal } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { HeroTitle } from '@/components/hero-title';
import { CiteButton } from '@/components/cite-dialog';
import { HomeView } from '@/components/home-view';
import { ViewTasksLink } from '@/components/task-actions';
import { buttonVariants } from '@/components/ui/button';

export default function HomePage() {
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
            <Link
              href="/run"
              className={buttonVariants({ variant: 'secondary', size: 'lg' })}
            >
              Run the benchmark
              <Terminal className="size-4" strokeWidth={2} aria-hidden />
            </Link>
            <ViewTasksLink />
            <Link
              href="/contribution-call"
              className={buttonVariants({ variant: 'secondary', size: 'lg' })}
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
            <HomeView />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
