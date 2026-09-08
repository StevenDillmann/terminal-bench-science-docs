/** Site teal for the all-domains total row (matches domain-context). */
export const ALL_DOMAINS_COLOR = "#038f99";

/** v0.1 task counts by domain and field (matches tasks/ in the repo). */
export type TaskSubdomainCoverage = {
  label: string;
  /** Folder under tasks/<domain>/ in the task repo. */
  path: string;
  count: number;
};

export type TaskDomainCoverageGroup = {
  label: string;
  /** Folder under tasks/ in the task repo. */
  path: string;
  color: string;
  count: number;
  subdomains: TaskSubdomainCoverage[];
};

export const TASK_DOMAIN_COVERAGE: TaskDomainCoverageGroup[] = [
  {
    label: "LIFE SCIENCES",
    path: "life-sciences",
    color: "#3D8A2D",
    count: 19,
    subdomains: [
      { label: "Biology", path: "biology", count: 8 },
      { label: "Medicine & Health", path: "medicine", count: 6 },
      { label: "Neuroscience", path: "neuroscience", count: 4 },
      { label: "Ecology & Evolution", path: "ecology", count: 1 },
    ],
  },
  {
    label: "PHYSICAL SCIENCES",
    path: "physical-sciences",
    color: "#C23637",
    count: 17,
    subdomains: [
      { label: "Astronomy & Cosmology", path: "astronomy", count: 6 },
      { label: "Physics", path: "physics", count: 5 },
      { label: "Materials Science", path: "materials-science", count: 4 },
      { label: "Chemistry", path: "chemistry", count: 2 },
    ],
  },
  {
    label: "EARTH SCIENCES",
    path: "earth-sciences",
    color: "#0168A9",
    count: 8,
    subdomains: [
      { label: "Geoscience", path: "geosciences", count: 5 },
      { label: "Atmosphere & Climate", path: "atmospheric-sciences", count: 1 },
      { label: "Ocean & Marine", path: "ocean-sciences", count: 1 },
      {
        label: "Environment & Sustainability",
        path: "environmental-sciences",
        count: 1,
      },
    ],
  },
  {
    label: "MATHEMATICAL SCIENCES",
    path: "mathematical-sciences",
    color: "#C59527",
    count: 17,
    subdomains: [
      {
        label: "Applied Mathematics & Scientific Computing",
        path: "applied-mathematics",
        count: 6,
      },
      {
        label: "Operations Research & Optimization",
        path: "operations-research",
        count: 5,
      },
      {
        label: "Formal Mathematics & Theorem Proving",
        path: "formal-mathematics",
        count: 3,
      },
      { label: "Statistics", path: "statistics", count: 3 },
    ],
  },
  {
    label: "ENGINEERING SCIENCES",
    path: "engineering-sciences",
    color: "#657086",
    count: 9,
    subdomains: [
      {
        label: "Mechanical & Aerospace Engineering",
        path: "mechanical-engineering",
        count: 5,
      },
      {
        label: "Electrical & Computer Engineering",
        path: "electrical-engineering",
        count: 2,
      },
      {
        label: "Chemical & Process Engineering",
        path: "chemical-engineering",
        count: 1,
      },
      {
        label: "Civil & Structural Engineering",
        path: "civil-engineering",
        count: 1,
      },
    ],
  },
] as const;

export const TASK_DOMAIN_COVERAGE_TOTAL = TASK_DOMAIN_COVERAGE.reduce(
  (sum, group) => sum + group.count,
  0,
);
