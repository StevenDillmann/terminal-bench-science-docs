import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { domainTasksUrl, getDomain, type DomainId } from "@/lib/domain-context";

/**
 * Panel title shared by every view: "Terminal-Bench-Science 0.1 <View> /
 * <Domain> / <N> tasks". The domain is plain text (no accent) so on-screen
 * and exported titles match; the task count links to Hub or the GitHub folder.
 */
export function ViewTitle({
  view,
  domain,
  taskCount,
}: {
  view: string;
  domain: DomainId;
  taskCount: number | null;
}) {
  const domainDefinition = getDomain(domain);
  return (
    <>
      Terminal-Bench-Science 0.1 {view}
      {domain !== "all" ? (
        <>
          {" / "}
          <span>{domainDefinition.title}</span>
        </>
      ) : null}
      {" / "}
      <a
        href={domainTasksUrl(domain)}
        target="_blank"
        rel="noreferrer"
        data-export-plain
        className="inline-flex items-baseline gap-0.5 underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-current"
      >
        {taskCount != null ? `${taskCount} tasks` : "Tasks"}
        <HugeiconsIcon
          data-export-ignore
          icon={ArrowUpRight01Icon}
          strokeWidth={2}
          className="size-3 self-center"
        />
      </a>
    </>
  );
}
