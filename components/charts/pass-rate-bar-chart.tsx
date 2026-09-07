import {
  TERMINAL_BENCH_LEADERBOARD,
  TERMINAL_BENCH_PACKAGE,
  harborLeaderboardUrl,
} from '@/lib/leaderboard';
import { SCIENCE_ANNOUNCEMENT_LEADERBOARD_SNAPSHOT } from '@/lib/science-announcement-leaderboard-snapshot';
import { SiteLogo } from '@/components/site-logo';

const ROW_HEIGHT = 38;
const LABEL_WIDTH = 100;
const BAR_GAP = 4;
const VALUE_WIDTH = 52;
const VALUE_GAP = 8;
const MARGIN = { top: 4, right: 8, bottom: 28, left: 8 };
const BAR_HEIGHT = 22;
/** Match the landing-page resolution-rate bars: always scale against 100%. */
const MAX_ACCURACY = 100;
const TICKS = [0, 25, 50, 75, 100] as const;
/** Error bars show one standard error, matching the leaderboard. */
const ERROR_BAR_MULTIPLIER = 1;
const BAR_COLOR = '#038f99';
/** Half-height of the whisker end caps, in px. */
const WHISKER_CAP = 4;

function formatPassRate(value: number): string {
  return `${value.toLocaleString('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`;
}

export function PassRateBarChart() {
  const leaderboardUrl = harborLeaderboardUrl(
    TERMINAL_BENCH_PACKAGE,
    TERMINAL_BENCH_LEADERBOARD,
  );
  const rows = SCIENCE_ANNOUNCEMENT_LEADERBOARD_SNAPSHOT.filter(
    (row) => row.status === 'display',
  ).sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  const width = 760;
  const barStartX = MARGIN.left + LABEL_WIDTH + BAR_GAP;
  const plotWidth =
    width - barStartX - VALUE_GAP - VALUE_WIDTH - MARGIN.right;
  const height = MARGIN.top + MARGIN.bottom + rows.length * ROW_HEIGHT;

  return (
    <figure className="my-6 w-full max-w-none not-prose">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p
          className="min-w-0 whitespace-nowrap text-sm uppercase text-muted-foreground"
          style={{ paddingLeft: MARGIN.left }}
        >
          Terminal-Bench-Science 0.1 Leaderboard
        </p>
        <div className="mr-5 mt-1.5 shrink-0">
          <SiteLogo className="h-7" />
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          role="img"
          aria-label="Resolution rates across 70 scientific workflow tasks on Terminal-Bench-Science 0.1"
          className="mx-auto block w-full text-foreground"
        >
          {TICKS.map((tick) => {
            const x = barStartX + (tick / MAX_ACCURACY) * plotWidth;
            return (
              <g key={tick}>
                <line
                  x1={x}
                  y1={MARGIN.top}
                  x2={x}
                  y2={MARGIN.top + rows.length * ROW_HEIGHT}
                  className="stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={11}
                >
                  {`${tick}%`}
                </text>
              </g>
            );
          })}

          {rows.map((row, index) => {
            const y = MARGIN.top + index * ROW_HEIGHT;
            const barY = y + (ROW_HEIGHT - BAR_HEIGHT) / 2;
            const barWidth = (row.accuracy / MAX_ACCURACY) * plotWidth;
            const ciHalf = ERROR_BAR_MULTIPLIER * row.accuracyStderr;
            const ciLowerX =
              barStartX +
              (Math.max(0, row.accuracy - ciHalf) / MAX_ACCURACY) * plotWidth;
            const ciUpperX =
              barStartX +
              (Math.min(MAX_ACCURACY, row.accuracy + ciHalf) / MAX_ACCURACY) *
                plotWidth;
            const whiskerY = barY + BAR_HEIGHT / 2;

            return (
              <g key={`${row.rank}-${row.model}-${row.agent}`}>
                <text
                  x={MARGIN.left}
                  y={y + 14}
                  textAnchor="start"
                  className="fill-foreground"
                  fontSize={12}
                >
                  <tspan x={MARGIN.left}>{row.model}</tspan>
                  <tspan
                    x={MARGIN.left}
                    dy={13}
                    className="fill-muted-foreground"
                    fontSize={10}
                  >
                    {row.agent}
                  </tspan>
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
                  width={Math.max(barWidth, 1)}
                  height={BAR_HEIGHT}
                  fill={BAR_COLOR}
                />
                {ciUpperX > ciLowerX ? (
                  <g className="stroke-foreground" strokeWidth={1}>
                    <line x1={ciLowerX} x2={ciUpperX} y1={whiskerY} y2={whiskerY} />
                    <line
                      x1={ciLowerX}
                      x2={ciLowerX}
                      y1={whiskerY - WHISKER_CAP}
                      y2={whiskerY + WHISKER_CAP}
                    />
                    <line
                      x1={ciUpperX}
                      x2={ciUpperX}
                      y1={whiskerY - WHISKER_CAP}
                      y2={whiskerY + WHISKER_CAP}
                    />
                  </g>
                ) : null}
                <text
                  x={barStartX + plotWidth + VALUE_GAP}
                  y={y + ROW_HEIGHT / 2}
                  dominantBaseline="central"
                  className="fill-muted-foreground"
                  fontSize={12}
                >
                  {formatPassRate(row.accuracy)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-1 text-center text-sm text-muted-foreground">
        <a
          href={leaderboardUrl}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Resolution rates across 70 scientific workflow tasks on Terminal-Bench-Science 0.1
        </a>
      </figcaption>
    </figure>
  );
}
