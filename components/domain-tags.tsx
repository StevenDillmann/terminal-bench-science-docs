"use client";

import { DOMAINS, domainTasksUrl, type DomainId } from "@/lib/domain-context";
import { DOMAIN_ICONS } from "@/lib/domain-icons";
import { TASK_DOMAIN_COVERAGE } from "@/lib/task-domain-coverage-data";

/** Fields per domain, from the same data as the coverage chart. */
function fieldsFor(domainId: DomainId) {
  const title = DOMAINS.find((d) => d.id === domainId)?.title.toUpperCase();
  const group = TASK_DOMAIN_COVERAGE.find(
    (g) => g.label.toUpperCase() === title,
  );
  return group?.subdomains ?? [];
}

const linkClass =
  "underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current";

/**
 * The five science domains with their fields, in the toggle's icons and
 * colors. Domain names open their folder in the task repo; fields open the
 * subfolder.
 */
export function DomainTags() {
  return (
    // Six-column grid: three cards on the first row, two wider ones below,
    // so the longer field names stay on one line.
    <ul className="not-prose my-5 grid gap-3 sm:grid-cols-2 md:grid-cols-6">
      {DOMAINS.filter((domain) => domain.id !== "all").map((domain, index) => {
        const Icon = DOMAIN_ICONS[domain.id];
        const domainUrl = domainTasksUrl(domain.id);
        return (
          <li
            key={domain.id}
            className={`flex flex-col gap-2 rounded-lg border p-3 ${index < 3 ? "md:col-span-2" : "md:col-span-3"}`}
            style={{
              borderColor: `color-mix(in srgb, ${domain.color} 35%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${domain.color} 5%, transparent)`,
            }}
          >
            <a
              href={domainUrl}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.06em] uppercase ${linkClass}`}
              style={{ color: domain.color }}
            >
              <Icon className="size-3.5" strokeWidth={2} aria-hidden />
              {domain.title}
            </a>
            <ul className="flex flex-col gap-0.5 text-sm text-muted-foreground">
              {fieldsFor(domain.id).map((field) => (
                <li key={field.path} className="md:whitespace-nowrap">
                  <a
                    href={`${domainUrl}/${field.path}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`${linkClass} hover:text-foreground`}
                  >
                    {field.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
