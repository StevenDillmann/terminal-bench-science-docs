'use client';

import { ArrowRight02Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQueryState } from 'nuqs';
import type { CSSProperties } from 'react';

import { buttonVariants } from '@/components/ui/button';
import {
  domainTasksUrl,
  getDomain,
  parseHomeDomain,
} from '@/lib/domain-context';
import { cn } from '@/lib/utils';

const secondaryActionClass = buttonVariants({
  variant: 'secondary',
  size: 'lg',
});

export function TaskActions() {
  const [domain] = useQueryState('domain', parseHomeDomain);
  const accentColor = getDomain(domain).color;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <a
        href={domainTasksUrl(domain)}
        target="_blank"
        rel="noreferrer"
        style={{ '--view-tasks-accent': accentColor } as CSSProperties}
        className={cn(
          secondaryActionClass,
          'transition-colors hover:!bg-[color-mix(in_srgb,var(--view-tasks-accent)_10%,transparent)] hover:!text-[var(--view-tasks-accent)] dark:hover:!bg-[color-mix(in_srgb,var(--view-tasks-accent)_15%,transparent)]',
        )}
      >
        View the tasks
        <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} />
      </a>
      <a
        href="https://github.com/harbor-framework/terminal-bench-science/blob/main/CONTRIBUTING.md"
        target="_blank"
        rel="noreferrer"
        className={secondaryActionClass}
      >
        Contribute a task
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
      </a>
    </div>
  );
}
