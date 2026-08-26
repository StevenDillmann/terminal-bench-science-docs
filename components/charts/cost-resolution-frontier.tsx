import {
  ParetoScatterChart,
  type ParetoDatum,
} from '@/components/charts/pareto-scatter-chart';

type FrontierPoint = Omit<
  ParetoDatum,
  'onFrontier' | 'x' | 'labelSide' | 'labelOffsetY'
> & {
  cost: number;
  tokens: number;
  charts?: ('cost' | 'tokens')[];
  /** Per-chart label side, to dodge neighbouring labels. */
  labelSide?: Partial<Record<'cost' | 'tokens', 'left' | 'right'>>;
  /** Per-chart vertical label nudge in px (positive moves it down). */
  labelOffsetY?: Partial<Record<'cost' | 'tokens', number>>;
};

const BASE_DATA: FrontierPoint[] = [
  {
    id: 'gpt-5.6-luna-codex',
    label: {
      model: 'GPT-5.6 Luna',
      agent: 'Codex',
      full: 'GPT-5.6 Luna (Codex)',
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
    },
    reasoningEffort: null,
    cost: 3344.187332,
    tokens: 3_709_385_002,
    releaseDate: null,
    y: 7.1428571429,
    accuracyStderr: null,
    labelOffsetY: { tokens: 14 },
  },
  {
    id: 'gpt-5.6-sol-codex',
    label: {
      model: 'GPT-5.6 Sol',
      agent: 'Codex',
      full: 'GPT-5.6 Sol (Codex)',
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
    },
    reasoningEffort: null,
    cost: 2539.665996,
    tokens: 3_191_602_969,
    releaseDate: null,
    y: 7.1428571429,
    accuracyStderr: null,
    charts: ['tokens'],
    labelOffsetY: { tokens: -16 },
  },
  {
    id: 'glm-5.3-claude-code',
    label: {
      model: 'GLM 5.3',
      agent: 'Claude Code',
      full: 'GLM 5.3 (Claude Code)',
    },
    reasoningEffort: null,
    cost: 6802.566162,
    tokens: 8_486_097_200,
    releaseDate: null,
    y: 8.0952380952,
    accuracyStderr: null,
  },
];

function frontierData(
  xAxis: 'cost' | 'tokens',
  frontierIds: readonly string[],
): ParetoDatum[] {
  const frontier = new Set(frontierIds);
  return BASE_DATA.filter(
    (point) => !point.charts || point.charts.includes(xAxis),
  )
    .map(({ charts: _charts, labelSide, labelOffsetY, ...point }) => ({
      ...point,
      x: point[xAxis],
      onFrontier: frontier.has(point.id),
      labelSide: labelSide?.[xAxis],
      labelOffsetY: labelOffsetY?.[xAxis],
    }))
    .sort((a, b) => a.x - b.x);
}

const COST_DATA = frontierData('cost', [
  'gpt-5.6-luna-codex',
  'gpt-5.6-terra-codex',
  'gpt-5.6-sol-codex',
  'opus-5-claude-code',
]);

const TOKEN_DATA = frontierData('tokens', [
  'kimi-k3-claude-code',
  'fable-5-claude-code',
  'opus-5-claude-code',
]);

function ResolutionFrontier({
  data,
  xAxis,
  caption,
}: {
  data: ParetoDatum[];
  xAxis: 'cost' | 'tokens';
  caption: string;
}) {
  return (
    <figure className="my-6 w-full not-prose">
      <ParetoScatterChart
        data={data}
        xAxisId={xAxis}
        yAxisId="accuracy"
        domain="all"
        accentColor="#038f99"
        height={420}
        showNonFrontierLabels
      />
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
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
      data={COST_DATA}
      xAxis="cost"
      caption="Terminal-Bench-Science 0.1 Cost vs. Resolution Rate Pareto Frontier"
    />
  );
}

export function TokenResolutionFrontier() {
  return (
    <ResolutionFrontier
      data={TOKEN_DATA}
      xAxis="tokens"
      caption="Terminal-Bench-Science 0.1 Tokens vs. Resolution Rate Pareto Frontier"
    />
  );
}
