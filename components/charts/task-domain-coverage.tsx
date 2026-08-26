const DOMAINS = [
  { label: 'Life Sciences', count: 19, color: '#3D8A2D' },
  { label: 'Physical Sciences', count: 17, color: '#C23637' },
  { label: 'Earth Sciences', count: 8, color: '#0168A9' },
  { label: 'Mathematical Sciences', count: 17, color: '#C59527' },
  { label: 'Engineering Sciences', count: 9, color: '#657086' },
] as const;

const WIDTH = 720;
const LABEL_WIDTH = 184;
const COUNT_WIDTH = 64;
const MARGIN_X = 8;
const PLOT_WIDTH = WIDTH - LABEL_WIDTH - COUNT_WIDTH - MARGIN_X * 2;
const ROW_HEIGHT = 34;
const BAR_HEIGHT = 18;
const MAX_COUNT = 20;
const TICKS = [0, 5, 10, 15, 20] as const;
const CHART_HEIGHT = DOMAINS.length * ROW_HEIGHT + 28;

export function TaskDomainCoverage() {
  return (
    <figure className="mx-auto my-6 w-full max-w-none not-prose">
      <svg
        viewBox={`0 0 ${WIDTH} ${CHART_HEIGHT}`}
        width="100%"
        role="img"
        aria-label="Terminal-Bench-Science task coverage: 19 life sciences tasks, 17 physical sciences tasks, 8 earth sciences tasks, 17 mathematical sciences tasks, and 9 engineering sciences tasks"
        className="mx-auto block w-full"
      >
        {TICKS.map((tick) => {
          const x =
            MARGIN_X + LABEL_WIDTH + (tick / MAX_COUNT) * PLOT_WIDTH;
          return (
            <line
              key={`grid-${tick}`}
              x1={x}
              y1={0}
              x2={x}
              y2={DOMAINS.length * ROW_HEIGHT}
              className="stroke-border"
              strokeWidth={1}
            />
          );
        })}

        {DOMAINS.map((domain, index) => {
          const rowY = index * ROW_HEIGHT;
          const barY = rowY + (ROW_HEIGHT - BAR_HEIGHT) / 2;
          const barWidth = (domain.count / MAX_COUNT) * PLOT_WIDTH;
          return (
            <g key={domain.label}>
              <text
                x={MARGIN_X + LABEL_WIDTH - 12}
                y={rowY + ROW_HEIGHT / 2}
                textAnchor="end"
                dominantBaseline="central"
                className="fill-foreground"
                fontSize={12}
              >
                {domain.label}
              </text>
              <rect
                x={MARGIN_X + LABEL_WIDTH}
                y={barY}
                width={PLOT_WIDTH}
                height={BAR_HEIGHT}
                className="fill-muted"
              />
              <rect
                x={MARGIN_X + LABEL_WIDTH}
                y={barY}
                width={barWidth}
                height={BAR_HEIGHT}
                fill={domain.color}
              />
              <text
                x={MARGIN_X + LABEL_WIDTH + PLOT_WIDTH + 10}
                y={rowY + ROW_HEIGHT / 2}
                dominantBaseline="central"
                className="fill-muted-foreground"
                fontSize={12}
              >
                {domain.count}
              </text>
            </g>
          );
        })}

        {TICKS.map((tick) => (
          <text
            key={tick}
            x={MARGIN_X + LABEL_WIDTH + (tick / MAX_COUNT) * PLOT_WIDTH}
            y={CHART_HEIGHT - 5}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={10}
          >
            {tick}
          </text>
        ))}
      </svg>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        <a
          href="https://github.com/harbor-framework/terminal-bench-science#task-coverage"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Terminal-Bench-Science 0.1 Domain Coverage
        </a>
      </figcaption>
    </figure>
  );
}
