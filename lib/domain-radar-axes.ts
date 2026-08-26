export type DomainRadarAxis = {
  id: string;
  label: string;
};

export const ALL_DOMAIN_RADAR_AXES = [
  { id: 'life', label: 'Life Sciences' },
  { id: 'earth', label: 'Earth Sciences' },
  { id: 'engineering', label: 'Engineering Sciences' },
  { id: 'mathematical', label: 'Mathematical Sciences' },
  { id: 'physical', label: 'Physical Sciences' },
] as const satisfies readonly DomainRadarAxis[];
