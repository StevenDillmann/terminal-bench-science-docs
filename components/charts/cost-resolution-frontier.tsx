import {
  ParetoScatterChart,
  type ParetoDatum,
} from '@/components/charts/pareto-scatter-chart';
import { computeParetoFrontierIds } from '@/lib/pareto-frontier';

type FrontierPoint = Omit<
  ParetoDatum,
  'onFrontier' | 'x' | 'labelSide' | 'labelOffsetY'
> & {
  cost: number;
  tokens: number;
  /** Per-chart label side, to dodge neighbouring labels. */
  labelSide?: Partial<Record<'cost' | 'tokens', 'left' | 'right'>>;
  /** Per-chart vertical label nudge in px (positive moves it down). */
  labelOffsetY?: Partial<Record<'cost' | 'tokens', number>>;
  /** Per-chart label visibility (point still renders; tooltip on hover). */
  hideLabel?: Partial<Record<'cost' | 'tokens', boolean>>;
};

const BASE_DATA: FrontierPoint[] = [
  {
    id: 'gpt-5.6-luna-codex',
    label: {
      model: 'GPT-5.6 Luna',
      agent: 'Codex',
      full: 'GPT-5.6 Luna (Codex)',
      reasoningEffort: null,
    },
    reasoningEffort: null,
    cost: 383.1996396,
    tokens: 14_246_922_352,
    releaseDate: null,
    y: 3.3333333333,
    accuracyStderr: null,
  },
  {
    id: 'gpt-5.6-terra-codex',
    label: {
      model: 'GPT-5.6 Terra',
      agent: 'Codex',
      full: 'GPT-5.6 Terra (Codex)',
      reasoningEffort: null,
    },
    reasoningEffort: null,
    cost: 1983.9189369,
    tokens: 7_618_801_416,
    releaseDate: null,
    y: 8.5714285714,
    accuracyStderr: null,
    labelSide: { tokens: 'left' },
    labelOffsetY: { tokens: 8 },
  },
  {
    id: 'grok-4.6-grok-build',
    label: {
      model: 'Grok 4.6',
      agent: 'Grok Build',
      full: 'Grok 4.6 (Grok Build)',
      reasoningEffort: null,
    },
    reasoningEffort: null,
    cost: 3344.187332,
    tokens: 3_709_385_002,
    releaseDate: null,
    y: 7.1428571429,
    accuracyStderr: null,
    hideLabel: { cost: true },
    labelOffsetY: { tokens: 14 },
  },
  {
    id: 'gpt-5.6-sol-codex',
    label: {
      model: 'GPT-5.6 Sol',
      agent: 'Codex',
      full: 'GPT-5.6 Sol (Codex)',
      reasoningEffort: null,
    },
    reasoningEffort: null,
    cost: 4221.8683028,
    tokens: 8_406_870_193,
    releaseDate: null,
    y: 22.380952381,
    accuracyStderr: null,
  },
  {
    id: 'opus-4.8-claude-code',
    label: {
      model: 'Opus 4.8',
      agent: 'Claude Code',
      full: 'Opus 4.8 (Claude Code)',
      reasoningEffort: null,
    },
    reasoningEffort: null,
    cost: 5837.716905,
    tokens: 6_770_231_957,
    releaseDate: null,
    y: 10.4761904762,
    accuracyStderr: null,
    labelSide: { tokens: 'left' },
    labelOffsetY: { tokens: -6 },
  },
  {
    id: 'opus-5-claude-code',
    label: {
      model: 'Opus 5',
      agent: 'Claude Code',
      full: 'Opus 5 (Claude Code)',
      reasoningEffort: null,
    },
    reasoningEffort: null,
    cost: 6992.67732375,
    tokens: 7_266_668_313,
    releaseDate: null,
    y: 30,
    accuracyStderr: null,
  },
  {
    id: 'fable-5-claude-code',
    label: {
      model: 'Fable 5',
      agent: 'Claude Code',
      full: 'Fable 5 (Claude Code)',
      reasoningEffort: null,
    },
    reasoningEffort: null,
    cost: 14175.94818525,
    tokens: 6_363_562_181,
    releaseDate: null,
    y: 21.4285714286,
    accuracyStderr: null,
  },
  {
    id: 'kimi-k3-claude-code',
    label: {
      model: 'Kimi K3',
      agent: 'Claude Code',
      full: 'Kimi K3 (Claude Code)',
      reasoningEffort: null,
    },
    reasoningEffort: null,
    cost: 1523.7995976,
    tokens: 3_191_602_969,
    releaseDate: null,
    y: 7.1428571429,
    accuracyStderr: null,
    labelSide: { cost: 'right' },
    labelOffsetY: { cost: 10, tokens: -16 },
  },
  {
    id: 'glm-5.3-claude-code',
    label: {
      model: 'GLM 5.3',
      agent: 'Claude Code',
      full: 'GLM 5.3 (Claude Code)',
      reasoningEffort: null,
    },
    reasoningEffort: null,
    cost: 2733.16185912,
    tokens: 8_486_097_200,
    releaseDate: null,
    y: 8.0952380952,
    accuracyStderr: null,
    hideLabel: { cost: true },
  },
];

function buildFrontierData(xAxis: 'cost' | 'tokens'): ParetoDatum[] {
  const points = BASE_DATA.map(({ labelSide, labelOffsetY, hideLabel, ...point }) => ({
    ...point,
    x: point[xAxis],
    onFrontier: false,
    labelSide: labelSide?.[xAxis],
    labelOffsetY: labelOffsetY?.[xAxis],
    showLabel: hideLabel?.[xAxis] ? false : undefined,
  }));
  const frontier = computeParetoFrontierIds(points, 'min', 'max');
  return points
    .map((point) => ({
      ...point,
      onFrontier: frontier.has(point.id),
    }))
    .sort((a, b) => a.x - b.x);
}

const COST_DATA = buildFrontierData('cost');
const TOKEN_DATA = buildFrontierData('tokens');

const COST_FRONTIER_TITLE =
  'Terminal-Bench-Science 0.1 Cost vs. Resolution Rate';
const TOKEN_FRONTIER_TITLE =
  'Terminal-Bench-Science 0.1 Tokens vs. Resolution Rate';
const CHART_TITLE_MARGIN = 8;

function ResolutionFrontier({
  title,
  data,
  xAxis,
  caption,
}: {
  title: string;
  data: ParetoDatum[];
  xAxis: 'cost' | 'tokens';
  caption: string;
}) {
  return (
    <figure className="my-6 w-full max-w-none not-prose">
      <div className="mb-1 flex items-center">
        <p
          className="min-w-0 whitespace-nowrap text-sm uppercase text-muted-foreground"
          style={{ paddingLeft: CHART_TITLE_MARGIN }}
        >
          {title}
        </p>
      </div>
      <ParetoScatterChart
        data={data}
        xAxisId={xAxis}
        yAxisId="accuracy"
        domain="all"
        accentColor="#038f99"
        height={420}
        showNonFrontierLabels
      />
      <figcaption className="mt-1 text-center text-sm text-muted-foreground">
        <a
          href={`/?view=pareto&x=${xAxis}`}
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          {caption}
        </a>
      </figcaption>
    </figure>
  );
}

export function CostResolutionFrontier() {
  return (
    <ResolutionFrontier
      title={COST_FRONTIER_TITLE}
      data={COST_DATA}
      xAxis="cost"
      caption="Pareto frontier of cost and resolution rate across evaluated systems"
    />
  );
}

export function TokenResolutionFrontier() {
  return (
    <ResolutionFrontier
      title={TOKEN_FRONTIER_TITLE}
      data={TOKEN_DATA}
      xAxis="tokens"
      caption="Pareto frontier of token usage and resolution rate across evaluated systems"
    />
  );
}
