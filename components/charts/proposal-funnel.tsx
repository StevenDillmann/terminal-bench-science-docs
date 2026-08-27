import Link from 'next/link';

import {
  PROPOSAL_FUNNEL_ACCENT,
  PROPOSAL_FUNNEL_MAX,
  PROPOSAL_FUNNEL_STAGES,
} from '@/lib/proposal-funnel-data';

const WIDTH = 760;
const LABEL_WIDTH = 228;
const BAR_GAP = 0;
const VALUE_WIDTH = 44;
const RETENTION_WIDTH = 56;
const VALUE_GAP = 6;
const MARGIN = { top: 4, right: 8, bottom: 28, left: 8 };
const ROW_HEIGHT = 36;
const BAR_HEIGHT = 22;
const LABEL_FONT_SIZE = 13;
const COUNT_FONT_SIZE = 13;
const MIN_BAR_WIDTH = 12;
const TICKS = [0, 250, 500, 750, 1000] as const;

const CHART_CAPTION = `From ${PROPOSAL_FUNNEL_STAGES[0]!.count} task proposals to ${PROPOSAL_FUNNEL_STAGES[3]!.count} landing in Terminal-Bench-Science 0.1`;
const DASHBOARD_URL =
  'https://stevendillmann.github.io/tb-science-task-dashboard/';

function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

function formatRetention(value: number): string {
  return `${value.toLocaleString('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`;
}

export function ProposalFunnel() {
  const firstCount = PROPOSAL_FUNNEL_STAGES[0]!.count;
  const barStartX = MARGIN.left + LABEL_WIDTH + BAR_GAP;
  const plotWidth =
    WIDTH -
    barStartX -
    VALUE_GAP -
    VALUE_WIDTH -
    RETENTION_WIDTH -
    MARGIN.right;
  const height =
    MARGIN.top + MARGIN.bottom + PROPOSAL_FUNNEL_STAGES.length * ROW_HEIGHT;

  return (
    <figure className="mb-6 mt-2 w-full max-w-none not-prose">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          width="100%"
          role="img"
          aria-label="Contribution funnel from 920 task proposals to 464 approved proposals, 386 task pull requests, and 70 accepted tasks in Terminal-Bench-Science 0.1"
          className="mx-auto block w-full text-foreground"
        >
          {TICKS.map((tick) => {
            const x = barStartX + (tick / PROPOSAL_FUNNEL_MAX) * plotWidth;
            return (
              <g key={tick}>
                <line
                  x1={x}
                  y1={MARGIN.top}
                  x2={x}
                  y2={MARGIN.top + PROPOSAL_FUNNEL_STAGES.length * ROW_HEIGHT}
                  className="stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={11}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {PROPOSAL_FUNNEL_STAGES.map((stage, index) => {
            const y = MARGIN.top + index * ROW_HEIGHT;
            const barY = y + (ROW_HEIGHT - BAR_HEIGHT) / 2;
            const barWidth = Math.max(
              MIN_BAR_WIDTH,
              (stage.count / PROPOSAL_FUNNEL_MAX) * plotWidth,
            );
            const retention = (stage.count / firstCount) * 100;
            const isAcceptedTasks = stage.id === 'tasks';

            return (
              <g key={stage.id}>
                <text
                  x={MARGIN.left}
                  y={y + ROW_HEIGHT / 2}
                  dominantBaseline="central"
                  className={
                    isAcceptedTasks
                      ? 'font-semibold'
                      : 'fill-foreground font-medium'
                  }
                  fill={isAcceptedTasks ? PROPOSAL_FUNNEL_ACCENT : undefined}
                  fontSize={LABEL_FONT_SIZE}
                >
                  {stage.label}
                </text>
                <rect
                  x={barStartX}
                  y={barY}
                  width={barWidth}
                  height={BAR_HEIGHT}
                  fill={isAcceptedTasks ? PROPOSAL_FUNNEL_ACCENT : undefined}
                  className={isAcceptedTasks ? undefined : 'fill-border'}
                />
                <text
                  x={barStartX + plotWidth + VALUE_GAP}
                  y={y + ROW_HEIGHT / 2}
                  dominantBaseline="central"
                  className={
                    isAcceptedTasks
                      ? 'font-semibold tabular-nums'
                      : 'fill-foreground font-medium tabular-nums'
                  }
                  fill={isAcceptedTasks ? PROPOSAL_FUNNEL_ACCENT : undefined}
                  fontSize={COUNT_FONT_SIZE}
                >
                  {formatCount(stage.count)}
                </text>
                <text
                  x={barStartX + plotWidth + VALUE_GAP + VALUE_WIDTH + 8}
                  y={y + ROW_HEIGHT / 2}
                  dominantBaseline="central"
                  className={
                    isAcceptedTasks ? 'tabular-nums' : 'fill-muted-foreground tabular-nums'
                  }
                  fill={isAcceptedTasks ? PROPOSAL_FUNNEL_ACCENT : undefined}
                  fontSize={11}
                >
                  {formatRetention(retention)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-1 text-center text-sm text-muted-foreground">
        <Link
          href={DASHBOARD_URL}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          {CHART_CAPTION}
        </Link>
      </figcaption>
    </figure>
  );
}
