import Link from 'next/link';

import type { AnnouncementDomainRadarDatum } from '@/lib/science-announcement-domain-radar-snapshot';
import { ALL_DOMAIN_RADAR_AXES } from '@/lib/domain-radar-axes';
import { SCIENCE_ANNOUNCEMENT_DOMAIN_RADAR_SNAPSHOT } from '@/lib/science-announcement-domain-radar-snapshot';

const WIDTH = 520;
const HEIGHT = 520;
const CENTER = WIDTH / 2;
const RADIUS = 220;
const VIEWBOX = '-60 -35 640 590';

type Point = { x: number; y: number };

function pointAt(radius: number, index: number, axisCount: number): Point {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / axisCount;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function pointsToString(points: Point[]): string {
  return points.map(({ x, y }) => `${x},${y}`).join(' ');
}

function buildRadarScale(data: AnnouncementDomainRadarDatum[]) {
  const axes = ALL_DOMAIN_RADAR_AXES;
  const highestScore = Math.max(
    10,
    ...data.flatMap((datum) => axes.map((axis) => datum.scores[axis.id] ?? 0)),
  );
  const roughStep = highestScore / 5;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / magnitude;
  const stepMultiplier =
    normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10;
  const step = stepMultiplier * magnitude;
  const maximum = Math.min(100, Math.ceil(highestScore / step) * step);
  const steps = Array.from(
    { length: Math.round(maximum / step) },
    (_, index) => step * (index + 1),
  );
  return { maximum, steps };
}

function gridPoints(value: number, maximum: number): string {
  const axes = ALL_DOMAIN_RADAR_AXES;
  return pointsToString(
    axes.map((_, index) =>
      pointAt((RADIUS * value) / maximum, index, axes.length),
    ),
  );
}

function profilePoints(
  scores: AnnouncementDomainRadarDatum['scores'],
  maximum: number,
): string {
  const axes = ALL_DOMAIN_RADAR_AXES;
  return pointsToString(
    axes.map((axis, index) =>
      pointAt((RADIUS * scores[axis.id]!) / maximum, index, axes.length),
    ),
  );
}

function scoreLabelOffset(
  point: Point,
): { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' } {
  const horizontal = point.x - CENTER;
  const vertical = point.y - CENTER;
  const side =
    Math.abs(horizontal) > Math.abs(vertical)
      ? horizontal > 0
        ? 'right'
        : 'left'
      : vertical < 0
        ? 'top'
        : 'bottom';

  return {
    dx: side === 'right' ? 8 : side === 'left' ? -8 : 0,
    dy: side === 'top' ? -8 : side === 'bottom' ? 14 : 4,
    anchor: side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle',
  };
}

export function DomainRadarAnnouncement() {
  const data = SCIENCE_ANNOUNCEMENT_DOMAIN_RADAR_SNAPSHOT;
  const axes = ALL_DOMAIN_RADAR_AXES;
  const scale = buildRadarScale(data);

  return (
    <figure className="my-6 not-prose">
      <div className="mx-auto w-full max-w-md">
        <svg
          viewBox={VIEWBOX}
          width="100%"
          role="img"
          aria-label="Domain resolution rates for Opus 5 and GPT-5.6 Sol"
          className="mx-auto block text-foreground"
        >
          <title>Domain resolution rates: Claude Opus 5 vs GPT-5.6 Sol</title>

          {scale.steps.map((step) => (
            <polygon
              key={step}
              points={gridPoints(step, scale.maximum)}
              fill="none"
              className="stroke-border"
              strokeWidth={step === scale.maximum ? 1.5 : 1}
            />
          ))}

          {axes.map((axis, index) => {
            const end = pointAt(RADIUS, index, axes.length);
            const horizontal = end.x - CENTER;
            const vertical = end.y - CENTER;
            const sideLabel = Math.abs(horizontal) > Math.abs(vertical);
            const label = pointAt(
              RADIUS + (sideLabel ? 58 : vertical < 0 ? 30 : 38),
              index,
              axes.length,
            );
            return (
              <g key={axis.id}>
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={end.x}
                  y2={end.y}
                  className="stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-muted-foreground font-medium uppercase"
                  fontSize={13}
                >
                  <tspan x={label.x} y={label.y - 6}>
                    {axis.label.split(' ')[0]?.toUpperCase()}
                  </tspan>
                  <tspan x={label.x} y={label.y + 8}>
                    SCIENCES
                  </tspan>
                </text>
              </g>
            );
          })}

          {scale.steps.map((step) => (
            <text
              key={`score-${step}`}
              x={CENTER + 7}
              y={CENTER - (RADIUS * step) / scale.maximum + 4}
              className="fill-muted-foreground"
              fontSize={10}
            >
              {step}
            </text>
          ))}

          {data.map((datum) => (
            <polygon
              key={datum.id}
              points={profilePoints(datum.scores, scale.maximum)}
              fill="none"
              stroke={datum.color}
              strokeWidth={2.5}
              strokeDasharray={datum.strokeDasharray}
            />
          ))}

          {data.flatMap((datum) =>
            axes.map((axis, index) => {
              const score = datum.scores[axis.id]!;
              const point = pointAt(
                (RADIUS * score) / scale.maximum,
                index,
                axes.length,
              );
              const { dx, dy, anchor } = scoreLabelOffset(point);
              return (
                <text
                  key={`${datum.id}-${axis.id}`}
                  x={point.x + dx}
                  y={point.y + dy}
                  textAnchor={anchor}
                  fill={datum.color}
                  fontSize={11}
                  fontWeight={500}
                >
                  {score.toFixed(1)}%
                </text>
              );
            }),
          )}
        </svg>

        <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          {data.map((datum) => (
            <li key={datum.id} className="flex items-center gap-1.5">
              <svg aria-hidden="true" viewBox="0 0 24 6" className="h-1.5 w-5 shrink-0">
                <line
                  x1="0"
                  y1="3"
                  x2="24"
                  y2="3"
                  stroke={datum.color}
                  strokeWidth="2"
                  strokeDasharray={datum.strokeDasharray}
                />
              </svg>
              <span>{datum.label.model}</span>
            </li>
          ))}
        </ul>
      </div>

      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        <Link
          href="/?view=domains"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Terminal-Bench-Science 0.1 Domain Resolution Rates: Claude Opus 5 vs GPT-5.6 Sol
        </Link>
      </figcaption>
    </figure>
  );
}
