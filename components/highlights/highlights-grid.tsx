"use client";

import { useQueryState } from "nuqs";
import type { ReactNode } from "react";

import { parseHomeDomain, type DomainId } from "@/lib/domain-context";

export type HighlightItem = {
  id: string;
  domain: Exclude<DomainId, "all">;
  /** Placeholder awaiting the author's own text. */
  example: boolean;
  /** Server-rendered card. */
  node: ReactNode;
};

/** Filters server-rendered cards by the shared ?domain= selection. */
export function HighlightsGrid({
  items,
  limit,
  emptyText = "No highlights for this domain yet.",
}: {
  items: HighlightItem[];
  limit?: number;
  emptyText?: string;
}) {
  const [domain] = useQueryState("domain", parseHomeDomain);
  const visible = items
    .filter((item) => domain === "all" || item.domain === domain)
    .slice(0, limit);

  if (visible.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((item) => (
        <div key={item.id} className="min-w-0">
          {item.node}
        </div>
      ))}
    </div>
  );
}
