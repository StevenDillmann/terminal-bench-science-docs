'use client';

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo, useState, type CSSProperties } from 'react';

import {
  chartRowLabel,
  type ChartRowLabel,
} from '@/components/charts/chart-labels';
import {
  MODEL_STROKE_PATTERNS,
  modelLabColor,
} from '@/components/charts/model-colors';
import {
  ALL_DOMAIN_RADAR_AXES,
  DOMAIN_RADAR_SPOKE_AXES,
  type DomainRadarAxis,
  type DomainId,
  getDomain,
} from '@/lib/domain-context';
import {
  getAccessorValue,
  parseLeaderboardLink,
  type LeaderboardRow,
} from '@/lib/leaderboard';
import { cn } from '@/lib/utils';

export const DOMAIN_AXES = ALL_DOMAIN_RADAR_AXES;
export type DomainScores = Record<string, number>;

export type DomainRadarDatum = {
  id: string;
  label: ChartRowLabel;
  overall: number;
  overallCost: number;
  overallTokens: number;
  scores: DomainScores;
  domainCosts: DomainScores;
  domainTokens: DomainScores;
  color: string;
  strokeDasharray?: string;
};

const SIZE = 520;
const CENTER = SIZE / 2;
const RADIUS = 220;

function buildRadarScale(data: DomainRadarDatum[], axes: readonly DomainRadarAxis[]) {
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

function modelLab(row: LeaderboardRow): string {
  const model = parseLeaderboardLink(
    getAccessorValue(row, 'metadata.model_display'),
  );
  let lab = model?.label ?? row.id;
  if (model?.url) {
    try {
      lab = new URL(model.url).hostname.replace(/^www\./, '');
    } catch {
      lab = model.url;
    }
  }
  return lab;
}


function radarScore(
  row: LeaderboardRow,
  axisId: string,
): number {
  const value = getAccessorValue(
    row,
    `metrics.domain_metrics.${axisId}.accuracy`,
  );
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.round(Math.min(100, Math.max(0, value)) * 10) / 10
    : 0;
}

function numericMetric(
  row: LeaderboardRow,
  accessor: string,
  fallback: number,
): number {
  const value = getAccessorValue(row, accessor);
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function overallScore(row: LeaderboardRow): number {
  const value = numericMetric(row, 'metrics.accuracy', 0);
  return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
}

export function buildDomainRadarData(
  rows: LeaderboardRow[],
  axes: readonly DomainRadarAxis[] = DOMAIN_AXES,
): DomainRadarDatum[] {
  const labModelCounts = new Map<string, number>();
  return rows.map((row) => {
    const lab = modelLab(row);
    const modelIndex = labModelCounts.get(lab) ?? 0;
    labModelCounts.set(lab, modelIndex + 1);
    return {
      id: row.id,
      label: chartRowLabel(row),
      overall: overallScore(row),
      overallCost: numericMetric(
        row,
        'metrics.total_cost_usd',
        Number.POSITIVE_INFINITY,
      ),
      overallTokens: numericMetric(
        row,
        'metrics.total_tokens',
        Number.POSITIVE_INFINITY,
      ),
      scores: Object.fromEntries(
        axes.map((axis) => [axis.id, radarScore(row, axis.id)]),
      ) as DomainScores,
      domainCosts: Object.fromEntries(
        axes.map((axis) => [
          axis.id,
          numericMetric(
            row,
            `metrics.domain_metrics.${axis.id}.total_cost_usd`,
            Number.POSITIVE_INFINITY,
          ),
        ]),
      ) as DomainScores,
      domainTokens: Object.fromEntries(
        axes.map((axis) => [
          axis.id,
          numericMetric(
            row,
            `metrics.domain_metrics.${axis.id}.total_tokens`,
            Number.POSITIVE_INFINITY,
          ),
        ]),
      ) as DomainScores,
      color: modelLabColor(lab),
      strokeDasharray:
        MODEL_STROKE_PATTERNS[modelIndex % MODEL_STROKE_PATTERNS.length],
    };
  });
}

type Point = {
  x: number;
  y: number;
};

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

function compareAscending(left: number, right: number): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function gridPoints(
  value: number,
  maximum: number,
  axes: readonly DomainRadarAxis[],
): string {
  return pointsToString(
    axes.map((_, index) =>
      pointAt((RADIUS * value) / maximum, index, axes.length),
    ),
  );
}

function profilePoints(
  scores: DomainScores,
  maximum: number,
  axes: readonly DomainRadarAxis[],
): string {
  return pointsToString(
    axes.map((axis, index) =>
      pointAt((RADIUS * scores[axis.id]!) / maximum, index, axes.length),
    ),
  );
}

function ScoreLabels({
  datum,
  color,
  axes,
  maximum,
}: {
  datum: DomainRadarDatum;
  color: string;
  axes: readonly DomainRadarAxis[];
  maximum: number;
}) {
  return axes.map((axis, index) => {
    const score = datum.scores[axis.id]!;
    const point = pointAt((RADIUS * score) / maximum, index, axes.length);
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
    return (
      <text
        key={`${datum.id}-${axis.id}`}
        x={point.x + (side === 'right' ? 8 : side === 'left' ? -8 : 0)}
        y={point.y + (side === 'top' ? -8 : side === 'bottom' ? 14 : 4)}
        textAnchor={
          side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle'
        }
        fill={color}
        fontSize={11}
        fontWeight={500}
      >
        {score.toFixed(1)}%
      </text>
    );
  });
}

const ALL_COLUMN_ID = 'all';

type TableColumn = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
};

type DomainRadarChartProps = {
  data: DomainRadarDatum[];
  axes: readonly DomainRadarAxis[];
  spokeAxes?: readonly DomainRadarAxis[];
  className?: string;
  id?: string;
  defaultSelectedIds?: readonly string[];
  /** When false, render only the radar plot (for narrow embeds like the announcement). */
  showTable?: boolean;
  plotMaxWidth?: number;
};

export function DomainRadarChart({
  data,
  axes,
  spokeAxes = DOMAIN_RADAR_SPOKE_AXES,
  className,
  id,
  defaultSelectedIds = [],
  showTable = true,
  plotMaxWidth = 620,
}: DomainRadarChartProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [
    ...defaultSelectedIds,
  ]);
  const [sort, setSort] = useState<{
    axisId: string;
    direction: 'asc' | 'desc';
  } | null>(() => ({ axisId: ALL_COLUMN_ID, direction: 'desc' }));
  const labeledData = data.filter(
    (datum) => selectedIds.includes(datum.id) || datum.id === activeId,
  );
  const scale = buildRadarScale(data, spokeAxes);
  const tableColumns = useMemo<TableColumn[]>(
    () => [
      {
        id: ALL_COLUMN_ID,
        title: 'All',
        subtitle: 'Domains',
        color: getDomain('all').color,
      },
      ...axes.map((axis) => ({
        id: axis.id,
        title: axis.label.replace(' Sciences', ''),
        subtitle: 'Sciences',
        color: getDomain(axis.id as DomainId).color,
      })),
    ],
    [axes],
  );
  const sortedTableData = useMemo(() => {
    if (!sort) return data;
    return [...data].sort((left, right) => {
      const delta =
        sort.axisId === ALL_COLUMN_ID
          ? left.overall - right.overall
          : (left.scores[sort.axisId] ?? 0) -
            (right.scores[sort.axisId] ?? 0);
      if (delta !== 0) return sort.direction === 'asc' ? delta : -delta;

      const costDelta = compareAscending(
        sort.axisId === ALL_COLUMN_ID
          ? left.overallCost
          : (left.domainCosts[sort.axisId] ?? Number.POSITIVE_INFINITY),
        sort.axisId === ALL_COLUMN_ID
          ? right.overallCost
          : (right.domainCosts[sort.axisId] ?? Number.POSITIVE_INFINITY),
      );
      if (costDelta !== 0) return costDelta;

      const tokenDelta = compareAscending(
        sort.axisId === ALL_COLUMN_ID
          ? left.overallTokens
          : (left.domainTokens[sort.axisId] ?? Number.POSITIVE_INFINITY),
        sort.axisId === ALL_COLUMN_ID
          ? right.overallTokens
          : (right.domainTokens[sort.axisId] ?? Number.POSITIVE_INFINITY),
      );
      if (tokenDelta !== 0) return tokenDelta;

      return left.label.full.localeCompare(right.label.full);
    });
  }, [data, sort]);

  function toggleSelection(id: string) {
    setSelectedIds((selected) => {
      if (selected.includes(id)) return selected.filter((value) => value !== id);
      return [...selected, id];
    });
  }

  if (data.length === 0) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted-foreground">
        No leaderboard rows match the current filters.
      </p>
    );
  }

  return (
    <div id={id} className={className}>
      <div
        className={cn(
          showTable
            ? 'grid min-w-0 lg:grid-cols-[minmax(34rem,1.08fr)_minmax(28rem,0.92fr)]'
            : 'mx-auto flex w-full max-w-sm flex-col items-center',
        )}
      >
        {showTable ? (
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="h-12 min-w-44 border-r border-b bg-sidebar px-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Model / Agent
                </th>
                {tableColumns.map((column) => {
                  const isSorted = sort?.axisId === column.id;
                  return (
                    <th
                      key={column.id}
                      aria-sort={
                        isSorted
                          ? sort.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                      className="h-12 min-w-18 border-r border-b px-2 text-center text-[10px] leading-tight font-medium uppercase last:border-r-0"
                      style={
                        {
                          '--domain-header-color': column.color,
                          color: isSorted ? column.color : 'var(--foreground)',
                          backgroundColor: isSorted
                            ? `color-mix(in oklch, ${column.color} 10%, var(--card))`
                            : undefined,
                        } as CSSProperties
                      }
                    >
                      <button
                        type="button"
                        className="flex w-full flex-col items-center justify-center gap-0.5 uppercase hover:text-[var(--domain-header-color)]"
                        onClick={() =>
                          setSort((current) =>
                            current?.axisId === column.id
                              ? {
                                  axisId: column.id,
                                  direction:
                                    current.direction === 'desc' ? 'asc' : 'desc',
                                }
                              : { axisId: column.id, direction: 'desc' },
                          )
                        }
                      >
                        <span>{column.title}</span>
                        <span className="text-[8px] tracking-[0.1em]">
                          {column.subtitle}
                        </span>
                        <HugeiconsIcon
                          icon={
                            !isSorted
                              ? ArrowUpDownIcon
                              : sort.direction === 'asc'
                                ? ArrowUp01Icon
                                : ArrowDown01Icon
                          }
                          strokeWidth={2}
                          className="size-3"
                        />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedTableData.map((datum) => {
                const selectedIndex = selectedIds.indexOf(datum.id);
                const selectedColor =
                  selectedIndex >= 0 ? datum.color : undefined;
                const isActive = activeId === datum.id || selectedColor != null;
                return (
                  <tr
                    key={datum.id}
                    className="group"
                    style={{
                      backgroundColor: selectedColor
                        ? `color-mix(in oklch, ${selectedColor} 10%, var(--card))`
                        : undefined,
                    }}
                    onMouseEnter={() => setActiveId(datum.id)}
                    onMouseLeave={() => setActiveId(null)}
                  >
                    <th
                      scope="row"
                      className="border-r border-b bg-card px-3 py-2 text-left group-hover:bg-muted"
                      style={{
                        borderLeft: `2px solid ${selectedColor ?? 'transparent'}`,
                      }}
                    >
                      <button
                        type="button"
                        className="flex w-full min-w-0 items-center justify-between gap-3 text-left outline-none"
                        onFocus={() => setActiveId(datum.id)}
                        onBlur={() => setActiveId(null)}
                        onClick={() => toggleSelection(datum.id)}
                      >
                        <span className="min-w-0">
                          <span
                            className="block truncate text-xs font-medium"
                            style={{
                              color: isActive
                                ? selectedColor ?? datum.color
                                : undefined,
                            }}
                          >
                            {datum.label.model}
                            {datum.label.reasoningEffort ? (
                              <span className="font-normal text-muted-foreground">
                                {' '}({datum.label.reasoningEffort})
                              </span>
                            ) : null}
                          </span>
                          {datum.label.agent ? (
                            <span className="block truncate text-[10px] font-normal text-muted-foreground">
                              {datum.label.agent}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </th>
                    {tableColumns.map((column) => {
                      const score =
                        column.id === ALL_COLUMN_ID
                          ? datum.overall
                          : datum.scores[column.id] ?? 0;
                      // Once any model is selected, the row bands carry the
                      // color and the sorted column steps back to plain cells.
                      const tintSortedColumn =
                        sort?.axisId === column.id && selectedIds.length === 0;
                      return (
                        <td
                          key={column.id}
                          className={cn(
                            'border-r border-b px-2 py-2 text-center text-xs tabular-nums last:border-r-0',
                            tintSortedColumn && 'font-medium',
                          )}
                          style={
                            tintSortedColumn
                              ? {
                                  color: column.color,
                                  backgroundColor: `color-mix(in oklch, ${column.color} 10%, var(--card))`,
                                }
                              : undefined
                          }
                        >
                          {score.toFixed(1)}%
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        ) : null}
        <div
          className={cn(
            'flex min-w-0 flex-col items-center justify-center p-3',
            showTable && 'min-h-[32rem] border-t lg:border-t-0 lg:border-l',
          )}
        >
        <svg
          viewBox="-60 -35 640 590"
          role="img"
          aria-label="Resolution rates across five science domains"
          className="block w-full"
          style={{ maxWidth: plotMaxWidth }}
          onClick={() => {
            setSelectedIds([]);
            setActiveId(null);
          }}
        >
          <title>Radar chart</title>
        {scale.steps.map((step) => (
          <polygon
            key={step}
            points={gridPoints(step, scale.maximum, spokeAxes)}
            fill="none"
            className="stroke-border"
            strokeWidth={step === scale.maximum ? 1.5 : 1}
          />
        ))}
        {spokeAxes.map((axis, index) => {
          const end = pointAt(RADIUS, index, spokeAxes.length);
          const horizontal = end.x - CENTER;
          const vertical = end.y - CENTER;
          const sideLabel = Math.abs(horizontal) > Math.abs(vertical);
          const label = pointAt(
            RADIUS + (sideLabel ? 58 : vertical < 0 ? 30 : 38),
            index,
            spokeAxes.length,
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
        {data.map((datum) => {
          const selectedIndex = selectedIds.indexOf(datum.id);
          const selectedColor =
            selectedIndex >= 0
              ? datum.color
              : null;
          const isActive = activeId === datum.id || selectedColor != null;
          const isDimmed =
            (activeId != null || selectedIds.length > 0) && !isActive;
          const points = profilePoints(datum.scores, scale.maximum, spokeAxes);
          return (
            <g key={datum.id}>
              <polygon
                data-export-ignore=""
                points={points}
                fill="none"
                stroke="transparent"
                strokeWidth={18}
                pointerEvents="stroke"
                className="cursor-pointer outline-none"
                tabIndex={0}
                aria-label={`${datum.label.full}: ${spokeAxes.map(
                  (axis) => `${axis.label} ${datum.scores[axis.id]}`,
                ).join(', ')}`}
                onMouseEnter={() => setActiveId(datum.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(datum.id)}
                onBlur={() => setActiveId(null)}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSelection(datum.id);
                }}
              />
              <polygon
                points={points}
                fill="none"
                stroke={selectedColor ?? (isActive ? datum.color : '#9ca3af')}
                strokeWidth={isActive ? 3 : 1.5}
                strokeDasharray={datum.strokeDasharray}
                pointerEvents="none"
                className={cn(
                  'transition-opacity',
                  isDimmed && 'opacity-25',
                )}
              />
            </g>
          );
        })}
        {labeledData.map((datum) => (
          <ScoreLabels
            key={`scores-${datum.id}`}
            datum={datum}
            color={datum.color}
            axes={spokeAxes}
            maximum={scale.maximum}
          />
        ))}
      </svg>
          <ul className="flex w-full flex-wrap justify-center gap-x-4 gap-y-2 border-t pt-3 text-[10px]">
            {data.map((datum) => {
              const selected = selectedIds.includes(datum.id);
              return (
                <li key={datum.id} className="min-w-0">
                  <button
                    type="button"
                    aria-pressed={selected}
                    className="flex min-w-0 items-center gap-1.5 text-muted-foreground hover:text-foreground"
                    style={{ color: selected ? datum.color : undefined }}
                    onMouseEnter={() => setActiveId(datum.id)}
                    onMouseLeave={() => setActiveId(null)}
                    onFocus={() => setActiveId(datum.id)}
                    onBlur={() => setActiveId(null)}
                    onClick={() => toggleSelection(datum.id)}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 6"
                      className="h-1.5 w-5 shrink-0"
                    >
                      <line
                        x1="0"
                        y1="3"
                        x2="24"
                        y2="3"
                        stroke={selected ? datum.color : '#9ca3af'}
                        strokeWidth="2"
                        strokeDasharray={datum.strokeDasharray}
                      />
                    </svg>
                    <span className="truncate">{datum.label.model}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
