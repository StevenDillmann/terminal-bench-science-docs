import { createParser } from 'nuqs';

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
  all: GITHUB_TASKS_BASE,
  life: `${GITHUB_TASKS_BASE}/life-sciences`,
  physical: `${GITHUB_TASKS_BASE}/physical-sciences`,
  earth: `${GITHUB_TASKS_BASE}/earth-sciences`,
  mathematical: `${GITHUB_TASKS_BASE}/mathematical-sciences`,
  engineering: `${GITHUB_TASKS_BASE}/engineering-sciences`,
};

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
