import { createParser } from 'nuqs';

import { HUB_TASKS_URL } from '@/lib/leaderboard';

import {
  ALL_DOMAIN_RADAR_AXES,
  DOMAIN_RADAR_SPOKE_AXES,
  type DomainRadarAxis,
} from '@/lib/domain-radar-axes';

export { ALL_DOMAIN_RADAR_AXES, DOMAIN_RADAR_SPOKE_AXES, type DomainRadarAxis };

export const DOMAIN_IDS = [
  'all',
  'life',
  'physical',
  'earth',
  'mathematical',
  'engineering',
] as const;

export type DomainId = (typeof DOMAIN_IDS)[number];

type DomainDefinition = {
  id: DomainId;
  label: string;
  title: string;
  color: string;
};

export const DOMAINS: readonly DomainDefinition[] = [
  { id: 'all', label: 'ALL', title: 'All Domains', color: '#038f99' },
  { id: 'life', label: 'LIFE', title: 'Life Sciences', color: '#3D8A2D' },
  { id: 'physical', label: 'PHYSICAL', title: 'Physical Sciences', color: '#C23637' },
  { id: 'earth', label: 'EARTH', title: 'Earth Sciences', color: '#0168A9' },
  {
    id: 'mathematical',
    label: 'MATHEMATICAL',
    title: 'Mathematical Sciences',
    color: '#C59527',
  },
  {
    id: 'engineering',
    label: 'ENGINEERING',
    title: 'Engineering Sciences',
    color: '#657086',
  },
];

export function getDomain(domain: DomainId): DomainDefinition {
  return DOMAINS.find((entry) => entry.id === domain) ?? DOMAINS[0]!;
}

const GITHUB_TASKS_BASE =
  'https://github.com/harbor-framework/terminal-bench-science/tree/main/tasks';


const DOMAIN_TASK_PATHS: Record<DomainId, string> = {
  all: HUB_TASKS_URL,
  life: `${GITHUB_TASKS_BASE}/life-sciences`,
  physical: `${GITHUB_TASKS_BASE}/physical-sciences`,
  earth: `${GITHUB_TASKS_BASE}/earth-sciences`,
  mathematical: `${GITHUB_TASKS_BASE}/mathematical-sciences`,
  engineering: `${GITHUB_TASKS_BASE}/engineering-sciences`,
};

/** Terminal-Bench-Science 0.1 task counts, used when no task matrix is served. */
export const DOMAIN_TASK_COUNTS: Record<DomainId, number> = {
  all: 70,
  life: 19,
  physical: 17,
  earth: 8,
  mathematical: 17,
  engineering: 9,
};

/**
 * Tasks in a domain. Counts the served task list when there is one
 * (`metrics.tasks` is trials, i.e. tasks × attempts), else the known sizes.
 */
export function domainTaskCount(
  tasks: readonly { domain: string }[] | undefined,
  domain: DomainId,
): number {
  if (tasks?.length) {
    return domain === 'all'
      ? tasks.length
      : tasks.filter((task) => task.domain === domain).length;
  }
  return DOMAIN_TASK_COUNTS[domain];
}

export function domainTasksUrl(domain: DomainId): string {
  return DOMAIN_TASK_PATHS[domain];
}

export function domainExportTitle(domain: DomainId, view: string): string {
  const prefix = 'Terminal-Bench-Science 0.1';
  return domain === 'all'
    ? `${prefix} ${view}`
    : `${prefix} ${getDomain(domain).title} ${view}`;
}

export const parseHomeDomain = createParser({
  parse(value) {
    return (DOMAIN_IDS as readonly string[]).includes(value)
      ? (value as DomainId)
      : null;
  },
  serialize(value) {
    return value;
  },
})
  .withDefault('all' satisfies DomainId)
  .withOptions({ clearOnDefault: true });
