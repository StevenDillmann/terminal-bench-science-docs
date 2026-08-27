const WIDTH = 720;
const HEIGHT = 172;

const BOX_W = 164;
const BOX_H = 56;
const ROW_Y = 32;
const MARGIN_X = 4;
const GAP = (WIDTH - MARGIN_X * 2 - BOX_W * 3) / 2;
const LOOP_Y = ROW_Y + BOX_H + 44;

const FONT_SIZE = 12;
const LABEL_FONT_SIZE = 11;
const LINE_HEIGHT = 16;
const CHART_TITLE = 'Terminal-Bench-Science Feedback Loop';
const CHART_TITLE_MARGIN = 8;

type Rect = { x: number; y: number; w: number; h: number };

const community: Rect = { x: MARGIN_X, y: ROW_Y, w: BOX_W, h: BOX_H };
const benchmark: Rect = {
  x: MARGIN_X + BOX_W + GAP,
  y: ROW_Y,
  w: BOX_W,
  h: BOX_H,
};
const agents: Rect = {
  x: MARGIN_X + (BOX_W + GAP) * 2,
  y: ROW_Y,
  w: BOX_W,
  h: BOX_H,
};

/** Logo is 2449x468 (~5.23:1); fit it inside the benchmark box with padding. */
const LOGO_W = 140;
const LOGO_H = 27;

function centerX(rect: Rect) {
  return rect.x + rect.w / 2;
}

function MultilineText({
  x,
  y,
  lines,
  fontSize,
  className,
  anchor = 'middle',
}: {
  x: number;
  y: number;
  lines: readonly string[];
  fontSize: number;
  className: string;
  anchor?: 'start' | 'middle' | 'end';
}) {
  const blockHeight = lines.length * LINE_HEIGHT;
  const startY = y - blockHeight / 2 + LINE_HEIGHT * 0.72;

  return (
    <text
      x={x}
      y={startY}
      textAnchor={anchor}
      className={className}
      fontSize={fontSize}
    >
      {lines.map((line, index) => (
        <tspan key={line} x={x} dy={index === 0 ? 0 : LINE_HEIGHT}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function Box({ rect, lines }: { rect: Rect; lines?: readonly string[] }) {
  return (
    <g>
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.w}
        height={rect.h}
        className="fill-card stroke-border"
        strokeWidth={1}
      />
      {lines ? (
        <MultilineText
          x={centerX(rect)}
          y={rect.y + rect.h / 2}
          lines={lines}
          fontSize={FONT_SIZE}
          className="fill-foreground font-medium"
        />
      ) : null}
    </g>
  );
}

export function ScienceFeedbackLoop() {
  const rowMidY = ROW_Y + BOX_H / 2;
  const rowBottom = ROW_Y + BOX_H;

  const logoX = centerX(benchmark) - LOGO_W / 2;
  const logoY = benchmark.y + (benchmark.h - LOGO_H) / 2;

  return (
    <figure id="science-feedback-loop" className="my-6 not-prose">
      <div className="mb-1 flex items-center">
        <p
          className="min-w-0 whitespace-nowrap text-sm uppercase text-muted-foreground"
          style={{ paddingLeft: CHART_TITLE_MARGIN }}
        >
          {CHART_TITLE}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        role="img"
        aria-label="Feedback loop: the scientific community contributes workflows to Terminal-Bench-Science, which evaluates and improves frontier AI agents and models, which in turn assist scientific research"
        className="mx-auto block max-w-full"
      >
        <defs>
          <marker
            id="science-feedback-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground" />
          </marker>
        </defs>

        {/* community → benchmark */}
        <line
          x1={community.x + community.w}
          y1={rowMidY}
          x2={benchmark.x}
          y2={rowMidY}
          className="stroke-muted-foreground"
          strokeWidth={1.25}
          markerEnd="url(#science-feedback-arrow)"
        />

        {/* benchmark → agents */}
        <line
          x1={benchmark.x + benchmark.w}
          y1={rowMidY}
          x2={agents.x}
          y2={rowMidY}
          className="stroke-muted-foreground"
          strokeWidth={1.25}
          markerEnd="url(#science-feedback-arrow)"
        />

        {/* agents → community: loop back underneath the row */}
        <path
          d={`M ${centerX(agents)} ${rowBottom}
              V ${LOOP_Y}
              H ${centerX(community)}
              V ${rowBottom}`}
          fill="none"
          className="stroke-muted-foreground"
          strokeWidth={1.25}
          markerEnd="url(#science-feedback-arrow)"
        />

        <Box rect={community} lines={['SCIENTIFIC', 'COMMUNITY']} />
        <Box rect={agents} lines={['FRONTIER AI', 'AGENTS & MODELS']} />

        <Box rect={benchmark} />
        <image
          href="/tb-science-logo-light-bold.png"
          x={logoX}
          y={logoY}
          width={LOGO_W}
          height={LOGO_H}
          preserveAspectRatio="xMidYMid meet"
          className="dark:hidden"
        />
        <image
          href="/tb-science-logo-dark-bold.png"
          x={logoX}
          y={logoY}
          width={LOGO_W}
          height={LOGO_H}
          preserveAspectRatio="xMidYMid meet"
          className="hidden dark:block"
        />

        <MultilineText
          x={(community.x + community.w + benchmark.x) / 2}
          y={rowMidY - 22}
          lines={['Contribute', 'workflows']}
          fontSize={LABEL_FONT_SIZE}
          className="fill-muted-foreground"
        />
        <MultilineText
          x={(benchmark.x + benchmark.w + agents.x) / 2}
          y={rowMidY - 22}
          lines={['Evaluate &', 'improve']}
          fontSize={LABEL_FONT_SIZE}
          className="fill-muted-foreground"
        />
        <MultilineText
          x={WIDTH / 2}
          y={LOOP_Y + 18}
          lines={['Accelerate discovery']}
          fontSize={LABEL_FONT_SIZE}
          className="fill-muted-foreground"
        />
      </svg>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        <a
          href="https://www.tbench.ai/news/tb-science-announcement"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Terminal-Bench-Science Feedback Loop
        </a>
      </figcaption>
    </figure>
  );
}
