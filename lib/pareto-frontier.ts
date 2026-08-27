export type ParetoFrontierPoint = {
  id: string;
  x: number;
  y: number;
};

function isBetterOrEqual(
  a: number,
  b: number,
  prefer: 'max' | 'min',
): boolean {
  return prefer === 'max' ? a >= b : a <= b;
}

function isStrictlyBetter(
  a: number,
  b: number,
  prefer: 'max' | 'min',
): boolean {
  return prefer === 'max' ? a > b : a < b;
}

/** Pareto frontier for maximize-y / minimize-x (or custom preferences). */
export function computeParetoFrontierIds(
  points: ParetoFrontierPoint[],
  xPrefer: 'max' | 'min',
  yPrefer: 'max' | 'min' = 'max',
): Set<string> {
  const frontier = new Set<string>();
  for (const point of points) {
    const dominated = points.some(
      (other) =>
        other.id !== point.id &&
        isBetterOrEqual(other.x, point.x, xPrefer) &&
        isBetterOrEqual(other.y, point.y, yPrefer) &&
        (isStrictlyBetter(other.x, point.x, xPrefer) ||
          isStrictlyBetter(other.y, point.y, yPrefer)),
    );
    if (!dominated) frontier.add(point.id);
  }
  return frontier;
}
