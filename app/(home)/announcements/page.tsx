import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const POSTS = [
  {
    href: '/contribution-call',
    date: '2026-09-05',
    title: 'Terminal-Bench-Science 0.2 Call for Contributions',
    description:
      'Contribute your scientific workflows as benchmark tasks. Pull requests are due October 5, 2026.',
  },
  {
    href: '/announcement',
    date: '2026-08-27',
    title: 'Terminal-Bench-Science 0.1',
    description:
      'Evaluating AI agents on research workflows across scientific domains.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Announcements',
  description:
    'Releases and contribution calls from Terminal-Bench-Science.',
};

export default function AnnouncementsPage() {
  return (
    <article
      className={cn(
        'content-page mx-auto w-full max-w-3xl flex-1 px-4 py-12',
        GeistSans.className,
      )}
    >
      <h1>Announcements</h1>
      <p className="mb-10 text-muted-foreground">
        Releases and contribution calls from Terminal-Bench-Science.
      </p>
      <div className="-mx-4 overflow-hidden border bg-border sm:mx-0">
        {POSTS.map((post) => (
          <article
            key={post.href}
            className="border-b bg-card last:border-b-0 transition-colors hover:bg-muted/50"
          >
            <Link
              href={post.href}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-4 py-4 no-underline sm:gap-x-6"
            >
              <h2 className="min-w-0 text-base font-medium tracking-tight sm:text-lg">
                {post.title}
              </h2>
              <time
                dateTime={post.date}
                className="justify-self-end whitespace-nowrap pt-1 text-xs text-muted-foreground"
              >
                {dateFormatter.format(new Date(post.date))}
              </time>
              <p className="col-span-2 min-w-0 text-sm text-muted-foreground sm:col-span-1">
                {post.description}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </article>
  );
}
