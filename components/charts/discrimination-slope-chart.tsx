import {
  MODEL_STROKE_PATTERNS,
  labFromModelName,
  modelLabColor,
} from '@/components/charts/model-colors';
import {
  DISCRIMINATION_SLOPE_DATA,
  type DiscriminationSlopePoint,
} from '@/lib/discrimination-slope-data';

const WIDTH = 720;
const HEIGHT = 400;
const MARGIN = { top: 44, right: 165, bottom: 24, left: 190 };
const LEFT_X = MARGIN.left;
const RIGHT_X = WIDTH - MARGIN.right;
const MID_X = (LEFT_X + RIGHT_X) / 2;
const PLOT_TOP = MARGIN.top;
const PLOT_BOTTOM = HEIGHT - MARGIN.bottom;
const DOT_R = 4.5;
const NAME_FONT_SIZE = 12;
const VALUE_FONT_SIZE = 11;
const MIN_NAME_GAP = 16;
const MIN_VALUE_GAP = 14;
const HEADER_Y = 30;
const TERMINAL_BENCH_URL = 'https://www.tbench.ai/';

function formatPct(value: number): string {
  return `${value.toLocaleString('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`;
}

/** Nudge label Y positions so nearby scores don't overlap. */
function spreadLabels(
  values: Array<{ id: string; y: number }>,
  minGap: number,
  top: number,
  bottom: number,
): Map<string, number> {
  const sorted = [...values].sort((a, b) => a.y - b.y);
  const ys = sorted.map((item) => item.y);

  for (let i = 1; i < ys.length; i++) {
    if (ys[i]! - ys[i - 1]! < minGap) {
      ys[i] = ys[i - 1]! + minGap;
    }
  }

  let overflow = ys[ys.length - 1]! - bottom;
  if (overflow > 0) {
    for (let i = 0; i < ys.length; i++) ys[i]! -= overflow;
  }

  overflow = top - ys[0]!;
  if (overflow > 0) {
    for (let i = 0; i < ys.length; i++) ys[i]! += overflow;
  }

  // Second pass downward if top push caused collisions again.
  for (let i = 1; i < ys.length; i++) {
    if (ys[i]! - ys[i - 1]! < minGap) {
      ys[i] = ys[i - 1]! + minGap;
    }
  }

  const result = new Map<string, number>();
  sorted.forEach((item, index) => {
    result.set(item.id, ys[index]!);
  });
  return result;
}

type ColumnId = 'terminal' | 'tb3' | 'science';

type Column = {
  id: ColumnId;
  x: number;
  header: string;
  value: (row: DiscriminationSlopePoint) => number | null;
};

const COLUMNS: readonly Column[] = [
  {
    id: 'terminal',
    x: LEFT_X,
    header: 'Terminal-Bench 2.1',
    value: (row) => row.terminalAccuracy,
  },
  {
    id: 'tb3',
    x: MID_X,
    header: 'Terminal-Bench 3.0',
    value: (row) => row.tb3Accuracy,
  },
  {
    id: 'science',
    x: RIGHT_X,
    header: 'Terminal-Bench-Science 0.1',
    value: (row) => row.scienceAccuracy,
  },
];

type StyledRow = DiscriminationSlopePoint & {
  color: string;
  strokeDasharray: string | undefined;
};

/** Same scheme as the domain radar: color by lab, dash pattern by model within lab. */
function styleRows(rows: readonly DiscriminationSlopePoint[]): StyledRow[] {
  const labModelCounts = new Map<string, number>();
  return rows.map((row) => {
    const lab = labFromModelName(row.model);
    const modelIndex = labModelCounts.get(lab) ?? 0;
    labModelCounts.set(lab, modelIndex + 1);
    return {
      ...row,
      color: modelLabColor(lab),
      strokeDasharray:
        MODEL_STROKE_PATTERNS[modelIndex % MODEL_STROKE_PATTERNS.length],
    };
  });
}

export function DiscriminationSlopeChart() {
  const data = styleRows(DISCRIMINATION_SLOPE_DATA);
  const accuracies = data.flatMap((row) =>
    COLUMNS.map((column) => column.value(row)).filter(
      (value): value is number => value != null,
    ),
  );
  const rawMin = Math.min(...accuracies);
  const rawMax = Math.max(...accuracies);
  const pad = Math.max(4, (rawMax - rawMin) * 0.08);
  const yMin = Math.max(0, rawMin - pad);
  const yMax = Math.min(100, rawMax + pad);

  const yScale = (accuracy: number) => {
    const t = (accuracy - yMin) / (yMax - yMin || 1);
    return PLOT_BOTTOM - t * (PLOT_BOTTOM - PLOT_TOP);
  };

  // Outer axes carry "Model — value" labels; the middle axis carries values only.
  const labelY = new Map(
    COLUMNS.map((column) => [
      column.id,
      spreadLabels(
        data.flatMap((row) => {
          const value = column.value(row);
          return value == null ? [] : [{ id: row.model, y: yScale(value) }];
        }),
        column.id === 'tb3' ? MIN_VALUE_GAP : MIN_NAME_GAP,
        PLOT_TOP,
        PLOT_BOTTOM,
      ),
    ]),
  );

  return (
    <figure className="my-6 not-prose">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        role="img"
        aria-label="Resolution rate by model on Terminal-Bench 2.1, Terminal-Bench 3.0, and Terminal-Bench-Science 0.1"
        className="mx-auto block max-w-full"
      >
        {COLUMNS.map((column) => (
          <g key={column.id}>
            <text
              x={column.x}
              y={HEADER_Y}
              textAnchor="middle"
              className="fill-foreground font-mono"
              fontSize={12}
            >
              {column.header}
            </text>
            <line
              x1={column.x}
              y1={PLOT_TOP}
              x2={column.x}
              y2={PLOT_BOTTOM}
              className="stroke-border"
              strokeWidth={1.25}
            />
          </g>
        ))}

        {/* Lines first so every dot and label paints above them. */}
        {data.map((row) => {
          const points = COLUMNS.flatMap((column) => {
            const value = column.value(row);
            return value == null ? [] : [{ x: column.x, y: yScale(value) }];
          });
          if (points.length < 2) return null;
          return (
            <polyline
              key={`line-${row.model}`}
              points={points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={row.color}
              strokeWidth={1.75}
              strokeDasharray={row.strokeDasharray}
              strokeLinejoin="round"
            />
          );
        })}

        {data.map((row) =>
          COLUMNS.map((column) => {
            const value = column.value(row);
            if (value == null) return null;
            const y = yScale(value);
            const textY = labelY.get(column.id)?.get(row.model) ?? y;
            const isLeft = column.id === 'terminal';
            const showName = column.id !== 'tb3';
            return (
              <g key={`${column.id}-${row.model}`}>
                <circle
                  cx={column.x}
                  cy={y}
                  r={DOT_R}
                  fill={row.color}
                  className="stroke-background"
                  strokeWidth={1.5}
                />
                <text
                  x={isLeft ? column.x - 11 : column.x + 11}
                  y={textY}
                  textAnchor={isLeft ? 'end' : 'start'}
                  dominantBaseline="central"
                  paintOrder="stroke"
                  fill={row.color}
                  strokeWidth={3}
                  strokeLinejoin="round"
                  className="stroke-background font-mono"
                  fontSize={showName ? NAME_FONT_SIZE : VALUE_FONT_SIZE}
                >
                  {showName
                    ? `${row.model} — ${formatPct(value)}`
                    : formatPct(value)}
                </text>
              </g>
            );
          }),
        )}
      </svg>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        <a
          href={TERMINAL_BENCH_URL}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Resolution Rates on Terminal-Bench 2.1, Terminal-Bench 3.0, and
          Terminal-Bench-Science 0.1
        </a>
      </figcaption>
    </figure>
  );
}
