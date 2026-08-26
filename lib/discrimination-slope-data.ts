import { ANNOUNCEMENT_LEADERBOARD_SNAPSHOT } from '@/lib/announcement-leaderboard-snapshot';
import { SCIENCE_ANNOUNCEMENT_LEADERBOARD_SNAPSHOT } from '@/lib/science-announcement-leaderboard-snapshot';
import { TERMINAL_BENCH_2_1_LEADERBOARD_SNAPSHOT } from '@/lib/terminal-bench-2-1-leaderboard-snapshot';

export type DiscriminationSlopePoint = {
  /** Display name, as spelled on the Terminal-Bench boards (no "Claude " prefix). */
  model: string;
  /** Agent used for the Terminal-Bench-Science 0.1 run. */
  agent: string;
  /** Terminal-Bench-Science 0.1 pass rate (%). Every row has one. */
  scienceAccuracy: number;
  /** Terminal-Bench 3.0 pass rate (%), if the model was run. */
  tb3Accuracy: number | null;
  /** Agent for the Terminal-Bench 3.0 run; may differ from `agent`. */
  tb3Agent: string | null;
  /** Terminal-Bench 2.1 pass rate (%), if the model was run. */
  terminalAccuracy: number | null;
  /** Agent for the Terminal-Bench 2.1 run; may differ from `agent`. */
  terminalAgent: string | null;
};

/**
 * Models shown on the slope chart, in fixed display order. The order also fixes
 * each model's color, so it must not depend on rank.
 */
export const DISCRIMINATION_SLOPE_MODELS = [
  'Opus 5',
  'GPT-5.6 Sol',
  'Fable 5',
  'Opus 4.8',
  'GPT-5.6 Terra',
  'GPT-5.6 Luna',
] as const;

type BoardRow = {
  model: string;
  agent: string;
  accuracy: number;
  status: 'display' | 'hide';
  reasoningEffort?: string | null;
};

/**
 * Terminal-Bench 3.0 rows that post-date `ANNOUNCEMENT_LEADERBOARD_SNAPSHOT`.
 * Source: `harbor hub leaderboard show terminal-bench/terminal-bench/3-0-0 --json`,
 * read on 2026-08-26. Kept here (not in the snapshot) so the Pareto chart, which
 * also reads the snapshot, is unaffected.
 */
const TB3_SUPPLEMENTAL_ROWS: readonly BoardRow[] = [
  {
    model: 'Opus 5',
    agent: 'mini-SWE-agent',
    accuracy: 42.7,
    status: 'display',
    reasoningEffort: 'max',
  },
];

/**
 * The Science snapshot spells Anthropic models with a "Claude " prefix
 * ("Claude Fable 5") while the Terminal-Bench boards use "Fable 5".
 */
function normalizeModelName(model: string): string {
  return model.replace(/^Claude\s+/i, '').trim().toLowerCase();
}

/**
 * Best row for a model on another board: same agent first (display rows
 * preferred, then higher accuracy), otherwise any run of that model.
 */
function findBoardMatch(
  rows: readonly BoardRow[],
  model: string,
  agent: string,
): BoardRow | null {
  const key = normalizeModelName(model);
  const candidates = rows.filter((row) => normalizeModelName(row.model) === key);
  if (candidates.length === 0) return null;

  const rank = (row: BoardRow) =>
    (row.agent === agent ? 0 : 10) + (row.status === 'display' ? 0 : 1);

  return [...candidates].sort(
    (a, b) => rank(a) - rank(b) || b.accuracy - a.accuracy,
  )[0]!;
}

/**
 * Slope-chart rows anchored on the Terminal-Bench-Science 0.1 snapshot: one row
 * per model in `DISCRIMINATION_SLOPE_MODELS`, carrying that model's Terminal-Bench
 * 2.1 and 3.0 pass rates where a run exists.
 */
export function buildDiscriminationSlopeData(): DiscriminationSlopePoint[] {
  const tb3Rows: readonly BoardRow[] = [
    ...ANNOUNCEMENT_LEADERBOARD_SNAPSHOT,
    ...TB3_SUPPLEMENTAL_ROWS,
  ];
  const points: DiscriminationSlopePoint[] = [];

  for (const model of DISCRIMINATION_SLOPE_MODELS) {
    const key = normalizeModelName(model);
    const science = SCIENCE_ANNOUNCEMENT_LEADERBOARD_SNAPSHOT.find(
      (row) => row.status === 'display' && normalizeModelName(row.model) === key,
    );
    if (!science) continue;

    const tb3 = findBoardMatch(tb3Rows, model, science.agent);
    const terminal = findBoardMatch(
      TERMINAL_BENCH_2_1_LEADERBOARD_SNAPSHOT,
      model,
      science.agent,
    );

    points.push({
      model,
      agent: science.agent,
      scienceAccuracy: science.accuracy,
      tb3Accuracy: tb3?.accuracy ?? null,
      tb3Agent: tb3?.agent ?? null,
      terminalAccuracy: terminal?.accuracy ?? null,
      terminalAgent: terminal?.agent ?? null,
    });
  }

  return points;
}

export const DISCRIMINATION_SLOPE_DATA = buildDiscriminationSlopeData();
