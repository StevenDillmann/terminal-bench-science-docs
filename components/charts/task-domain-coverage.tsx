import type { ReactNode } from 'react';
import {
  ALL_DOMAINS_COLOR,
  TASK_DOMAIN_COVERAGE,
  TASK_DOMAIN_COVERAGE_TOTAL,
} from '@/lib/task-domain-coverage-data';

const WIDTH = 760;
const LABEL_WIDTH = 240;
const BAR_GAP = 4;
const VALUE_WIDTH = 24;
const VALUE_GAP = 6;
const MARGIN = { top: 2, right: 8, left: 8 };
const GROUP_ROW_HEIGHT = 20;
const FOOTER_ROW_HEIGHT = 20;
const ROW_HEIGHT = 24;
const BAR_HEIGHT = 12;
const MAX_COUNT = 10;
const TICKS = [0, 2, 4, 6, 8, 10] as const;

const CHART_TITLE = 'Terminal-Bench-Science 0.1 Task Coverage';
const CHART_CAPTION =
  '70 expert-curated tasks across five scientific domains';
const FOOTER_LABEL = `${TASK_DOMAIN_COVERAGE_TOTAL} TASKS IN TOTAL`;

type PlacedRow =
  | {
      kind: 'group';
      y: number;
      label: string;
      color: string;
      count: number;
    }
  | {
      kind: 'subdomain';
      y: number;
      label: string;
      color: string;
      count: number;
    };

function buildPlacedRows(): { rows: PlacedRow[]; plotBottomY: number } {
  const rows: PlacedRow[] = [];
  let y = MARGIN.top;

  for (const group of TASK_DOMAIN_COVERAGE) {
    rows.push({
      kind: 'group',
      y,
      label: group.label,
      color: group.color,
      count: group.count,
    });
    y += GROUP_ROW_HEIGHT;

    for (const subdomain of group.subdomains) {
      rows.push({
        kind: 'subdomain',
        y,
        label: subdomain.label,
        color: group.color,
        count: subdomain.count,
      });
      y += ROW_HEIGHT;
    }
  }

  return { rows, plotBottomY: y };
}

function renderRow(
  row: PlacedRow,
  barStartX: number,
  plotWidth: number,
): ReactNode {
  if (row.kind === 'group') {
    return (
      <g key={`group-${row.label}`}>
        <text
          x={MARGIN.left}
          y={row.y + GROUP_ROW_HEIGHT / 2}
          dominantBaseline="central"
          fill={row.color}
          fontSize={10}
          fontWeight={700}
          letterSpacing="0.04em"
        >
          {row.label}
        </text>
        <text
          x={barStartX + plotWidth + VALUE_GAP}
          y={row.y + GROUP_ROW_HEIGHT / 2}
          dominantBaseline="central"
          fill={row.color}
          fontSize={10}
          fontWeight={700}
        >
          {row.count}
        </text>
      </g>
    );
  }

  const barY = row.y + (ROW_HEIGHT - BAR_HEIGHT) / 2;
  const barWidth = (row.count / MAX_COUNT) * plotWidth;

  return (
    <g key={`${row.label}-${row.y}`}>
      <text
        x={MARGIN.left}
        y={row.y + ROW_HEIGHT / 2}
        textAnchor="start"
        dominantBaseline="central"
        className="fill-foreground"
        fontSize={10}
      >
        {row.label}
      </text>
      <rect
        x={barStartX}
        y={barY}
        width={plotWidth}
        height={BAR_HEIGHT}
        className="fill-muted"
      />
      <rect
        x={barStartX}
        y={barY}
        width={Math.max(barWidth, row.count > 0 ? 1 : 0)}
        height={BAR_HEIGHT}
        fill={row.color}
      />
      <text
        x={barStartX + plotWidth + VALUE_GAP}
        y={row.y + ROW_HEIGHT / 2}
        dominantBaseline="central"
        className="fill-muted-foreground"
        fontSize={10}
      >
        {row.count}
      </text>
    </g>
  );
}

export function TaskDomainCoverage() {
  const { rows, plotBottomY } = buildPlacedRows();
  const barStartX = MARGIN.left + LABEL_WIDTH + BAR_GAP;
  const plotWidth = WIDTH - barStartX - VALUE_GAP - VALUE_WIDTH - MARGIN.right;
  const footerY = plotBottomY + FOOTER_ROW_HEIGHT / 2;
  const height = plotBottomY + FOOTER_ROW_HEIGHT;

  return (
    <figure className="my-6 w-full max-w-none not-prose">
      <div className="mb-1 flex items-center">
        <p
          className="min-w-0 whitespace-nowrap text-sm uppercase text-muted-foreground"
          style={{ paddingLeft: MARGIN.left }}
        >
          {CHART_TITLE}
        </p>
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          width="100%"
          role="img"
          aria-label={`Terminal-Bench-Science task coverage: ${TASK_DOMAIN_COVERAGE_TOTAL} tasks across life, physical, earth, mathematical, and engineering sciences, broken down by field`}
          className="mx-auto block w-full text-foreground"
        >
          {TICKS.map((tick) => {
            const x = barStartX + (tick / MAX_COUNT) * plotWidth;
            return (
              <line
                key={tick}
                x1={x}
                y1={MARGIN.top}
                x2={x}
                y2={plotBottomY}
                className="stroke-border"
                strokeWidth={1}
              />
            );
          })}

          {rows.map((row) => renderRow(row, barStartX, plotWidth))}

          <g aria-hidden="true">
            <text
              x={MARGIN.left}
              y={footerY}
              dominantBaseline="central"
              fill={ALL_DOMAINS_COLOR}
              fontSize={10}
              fontWeight={700}
              letterSpacing="0.04em"
            >
              {FOOTER_LABEL}
            </text>
            {TICKS.map((tick) => (
              <text
                key={`tick-${tick}`}
                x={barStartX + (tick / MAX_COUNT) * plotWidth}
                y={footerY}
                dominantBaseline="central"
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={10}
              >
                {tick}
              </text>
            ))}
          </g>
        </svg>
      </div>
      <figcaption className="mt-1 text-center text-sm text-muted-foreground">
        <a
          href="https://github.com/harbor-framework/terminal-bench-science#task-coverage"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          {CHART_CAPTION}
        </a>
      </figcaption>
    </figure>
  );
}
