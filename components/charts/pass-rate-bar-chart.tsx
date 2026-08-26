import {
  TERMINAL_BENCH_LEADERBOARD,
  TERMINAL_BENCH_PACKAGE,
  harborLeaderboardUrl,
} from '@/lib/leaderboard';
import { SCIENCE_ANNOUNCEMENT_LEADERBOARD_SNAPSHOT } from '@/lib/science-announcement-leaderboard-snapshot';

const ROW_HEIGHT = 38;
const LABEL_WIDTH = 150;
const VALUE_WIDTH = 52;
const MARGIN = { top: 8, right: 8, bottom: 28, left: 8 };
const BAR_HEIGHT = 22;
/** Match the landing-page resolution-rate bars: always scale against 100%. */
const MAX_ACCURACY = 100;
const TICKS = [0, 25, 50, 75, 100] as const;

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
  const plotWidth = width - MARGIN.left - MARGIN.right - LABEL_WIDTH - VALUE_WIDTH;
  const height = MARGIN.top + MARGIN.bottom + rows.length * ROW_HEIGHT;

  return (
    <figure className="my-6 w-full max-w-none not-prose">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          role="img"
          aria-label="Resolution rates on Terminal-Bench-Science 0.1"
          className="mx-auto block w-full text-foreground"
        >
          {TICKS.map((tick) => {
            const x = MARGIN.left + LABEL_WIDTH + (tick / MAX_ACCURACY) * plotWidth;
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
            const labelX = MARGIN.left + LABEL_WIDTH - 12;

            return (
              <g key={`${row.rank}-${row.model}-${row.agent}`}>
                <text
                  x={labelX}
                  y={y + 14}
                  textAnchor="end"
                  className="fill-foreground"
                  fontSize={12}
                >
                  <tspan x={labelX}>{row.model}</tspan>
                  <tspan
                    x={labelX}
                    dy={13}
                    className="fill-muted-foreground"
                    fontSize={10}
                  >
                    {row.agent}
                  </tspan>
                </text>
                <rect
                  x={MARGIN.left + LABEL_WIDTH}
                  y={barY}
                  width={plotWidth}
                  height={BAR_HEIGHT}
                  className="fill-muted"
                />
                <rect
                  x={MARGIN.left + LABEL_WIDTH}
                  y={barY}
                  width={Math.max(barWidth, 1)}
                  height={BAR_HEIGHT}
                  className={
                    index === 0 ? 'fill-[#038f99]' : 'fill-[#038f99]/75'
                  }
                />
                <text
                  x={MARGIN.left + LABEL_WIDTH + plotWidth + 8}
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
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        <a
          href={leaderboardUrl}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Resolution Rates on Terminal-Bench-Science 0.1
        </a>
      </figcaption>
    </figure>
  );
}
