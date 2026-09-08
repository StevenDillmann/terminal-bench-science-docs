"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { getDomain, type DomainId } from "@/lib/domain-context";
import { DOMAIN_ICONS } from "@/lib/domain-icons";

const TASKS_BASE =
  "https://github.com/harbor-framework/terminal-bench-science/tree/main/tasks";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  year: "numeric",
});

export type HighlightCardProps = {
  title: string;
  taskPath: string;
  domain: Exclude<DomainId, "all">;
  author: string;
  affiliation?: string;
  image: string;
  imageAlt: string;
  date: string;
  example?: boolean;
  /** The author's insight, rendered from the MDX body. */
  children: ReactNode;
};

export function HighlightCard({
  title,
  taskPath,
  domain,
  author,
  affiliation,
  image,
  imageAlt,
  date,
  example,
  children,
}: HighlightCardProps) {
  const definition = getDomain(domain);
  const Icon = DOMAIN_ICONS[domain];
  const slug = taskPath.split("/").pop() ?? taskPath;

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      <a
        href={`${TASKS_BASE}/${taskPath}`}
        target="_blank"
        rel="noreferrer"
        className="relative block aspect-[16/10] overflow-hidden border-b bg-muted/40"
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top"
        />
        {example ? (
          <span className="absolute top-2 right-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase ring-1 ring-border">
            Example
          </span>
        ) : null}
      </a>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3 text-[11px] font-medium tracking-[0.08em] uppercase">
          <span
            className="inline-flex items-center gap-1.5"
            style={{ color: definition.color }}
          >
            <Icon className="size-3.5" strokeWidth={2} aria-hidden />
            {definition.title}
          </span>
          <time dateTime={date} className="text-muted-foreground">
            {dateFormatter.format(new Date(date))}
          </time>
        </div>
        <h3 className="text-base font-medium leading-snug tracking-tight">
          <a
            href={`${TASKS_BASE}/${taskPath}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-baseline gap-1 hover:underline"
          >
            {title}
            <ArrowUpRight
              className="size-3.5 self-center text-muted-foreground"
              strokeWidth={2}
              aria-hidden
            />
          </a>
          <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
            {slug}
          </span>
        </h3>
        <div className="text-sm leading-relaxed text-foreground/90 [&_p]:m-0 [&_p+p]:mt-2">
          {children}
        </div>
        <p className="mt-auto pt-1 text-xs text-muted-foreground">
          <span className="text-foreground">{author}</span>
          {affiliation ? `, ${affiliation}` : null}
        </p>
      </div>
    </article>
  );
}
