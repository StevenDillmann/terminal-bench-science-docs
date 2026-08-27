/** Site teal for the all-domains total row (matches domain-context). */
export const ALL_DOMAINS_COLOR = '#038f99';

/** v0.1 task counts by domain and field (matches tasks/ in the repo). */
export type TaskSubdomainCoverage = {
  label: string;
  count: number;
};

export type TaskDomainCoverageGroup = {
  label: string;
  color: string;
  count: number;
  subdomains: TaskSubdomainCoverage[];
};

export const TASK_DOMAIN_COVERAGE: TaskDomainCoverageGroup[] = [
  {
    label: 'LIFE SCIENCES',
    color: '#3D8A2D',
    count: 19,
    subdomains: [
      { label: 'Biology', count: 8 },
      { label: 'Medicine & Health', count: 6 },
      { label: 'Neuroscience', count: 4 },
      { label: 'Ecology & Evolution', count: 1 },
    ],
  },
  {
    label: 'PHYSICAL SCIENCES',
    color: '#C23637',
    count: 17,
    subdomains: [
      { label: 'Astronomy & Cosmology', count: 6 },
      { label: 'Physics', count: 5 },
      { label: 'Materials Science', count: 4 },
      { label: 'Chemistry', count: 2 },
    ],
  },
  {
    label: 'EARTH SCIENCES',
    color: '#0168A9',
    count: 8,
    subdomains: [
      { label: 'Geoscience', count: 5 },
      { label: 'Atmosphere & Climate', count: 1 },
      { label: 'Ocean & Marine', count: 1 },
      { label: 'Environment & Sustainability', count: 1 },
    ],
  },
  {
    label: 'MATHEMATICAL SCIENCES',
    color: '#C59527',
    count: 17,
    subdomains: [
      { label: 'Applied Mathematics & Scientific Computing', count: 6 },
      { label: 'Operations Research & Optimization', count: 5 },
      { label: 'Formal Mathematics & Theorem Proving', count: 3 },
      { label: 'Statistics', count: 3 },
    ],
  },
  {
    label: 'ENGINEERING SCIENCES',
    color: '#657086',
    count: 9,
    subdomains: [
      { label: 'Mechanical & Aerospace Engineering', count: 5 },
      { label: 'Electrical & Computer Engineering', count: 2 },
      { label: 'Chemical & Process Engineering', count: 1 },
      { label: 'Civil & Structural Engineering', count: 1 },
    ],
  },
] as const;

export const TASK_DOMAIN_COVERAGE_TOTAL = TASK_DOMAIN_COVERAGE.reduce(
  (sum, group) => sum + group.count,
  0,
);
