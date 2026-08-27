export type DomainRadarAxis = {
  id: string;
  label: string;
};

/** Column order for the domain radar table (matches site domain columns). */
export const ALL_DOMAIN_RADAR_AXES = [
  { id: 'life', label: 'Life Sciences' },
  { id: 'physical', label: 'Physical Sciences' },
  { id: 'earth', label: 'Earth Sciences' },
  { id: 'mathematical', label: 'Mathematical Sciences' },
  { id: 'engineering', label: 'Engineering Sciences' },
] as const satisfies readonly DomainRadarAxis[];

/** Clockwise spoke placement on the radar plot (top → right → bottom → left). */
export const DOMAIN_RADAR_SPOKE_AXES = [
  { id: 'life', label: 'Life Sciences' },
  { id: 'earth', label: 'Earth Sciences' },
  { id: 'engineering', label: 'Engineering Sciences' },
  { id: 'mathematical', label: 'Mathematical Sciences' },
  { id: 'physical', label: 'Physical Sciences' },
] as const satisfies readonly DomainRadarAxis[];
