'use client';

import { ArrowUpRight } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { domainTasksUrl } from '@/lib/domain-context';

/** Hero button: the full task list on Harbor Hub. */
export function ViewTasksLink() {
  return (
    <a
      href={domainTasksUrl('all')}
      target="_blank"
      rel="noreferrer"
      className={buttonVariants({ variant: 'secondary', size: 'lg' })}
    >
      View the tasks
      <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden />
    </a>
  );
}
