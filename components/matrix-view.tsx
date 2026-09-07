'use client';

import { useQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { useMemo, useState, type CSSProperties } from 'react';

import { chartRowLabel } from '@/components/charts/chart-labels';
import {
  applyLeaderboardFilters,
  buildFilterFacets,
  type LeaderboardFilters,
  LeaderboardToolbar,
} from '@/components/leaderboard/leaderboard-toolbar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ViewDescriptionBar } from '@/components/view-description-bar';
import { ViewHeader } from '@/components/view-header';
import {
  fromUrlFilters,
  leaderboardFiltersParser,
  toUrlFilters,
} from '@/lib/leaderboard-url-state';
import {
  type LeaderboardTrialLink,
  harborTrialUrl,
  harborLeaderboardRowUrl,
  harborTaskUrl,
  TERMINAL_BENCH_LEADERBOARD,
  TERMINAL_BENCH_PACKAGE,
  fetchLeaderboard,
  getAccessorValue,
  leaderboardQueryKey,
  projectLeaderboardRowsToDomain,
  type LeaderboardMatrixTask,
  type LeaderboardRow,
  type LeaderboardTaskMatrix,
  type LeaderboardTaskOutcome,
} from '@/lib/leaderboard';
import {
  domainExportTitle,
  getDomain,
  type DomainId,
} from '@/lib/domain-context';
import { DOMAIN_ICONS } from '@/lib/domain-icons';
import {
  createExportClone,
  highResolutionExportScale,
  waitForExportImages,
} from '@/lib/export-view';
import {
  type PreparedExportImage,
  ViewExportMenu,
} from '@/components/view-export-menu';

const MATRIX_IMAGE_ID = 'task-matrix-image';
const MATRIX_SCROLL_ID = 'task-matrix-scroll';

function contrastColor(color: string): string {
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1_000;
  return luminance > 150 ? '#111827' : '#ffffff';
}

function colorStrength(ratio: number): number {
  if (ratio <= 0) return 0;
  if (ratio <= 1 / 3) return Math.round(ratio * 60);
  if (ratio <= 2 / 3) {
    return Math.round(20 + (ratio - 1 / 3) * 120);
  }
  return Math.round(60 + (ratio - 2 / 3) * 120);
}

function MatrixCell({
  outcome,
  accentColor,
  task,
  rowId,
  rowLabel,
  columnHighlighted,
  anyColumnHighlighted,
}: {
  outcome?: LeaderboardTaskOutcome;
  accentColor: string;
  task: LeaderboardMatrixTask;
  rowId: string;
  rowLabel: string;
  columnHighlighted: boolean;
  anyColumnHighlighted: boolean;
}) {
  const taskAccentColor = getDomain(task.domain).color;

  if (!outcome) {
    return (
      <td
        title={`${rowLabel} / ${task.slug}: no trials`}
        className="h-11 w-11 min-w-11 max-w-11 border-r border-b bg-muted/35 text-center text-[10px] tabular-nums text-muted-foreground"
      >
        —
      </td>
    );
  }

  const ratio = outcome.total > 0 ? outcome.solved / outcome.total : 0;
  const strength = colorStrength(ratio);
  const backgroundColor =
    ratio === 0
      ? 'var(--card)'
      : `color-mix(in oklch, ${accentColor} ${strength}%, var(--card))`;
  const hoverBackgroundColor = `color-mix(in oklch, ${taskAccentColor} ${Math.max(
    strength,
    20,
  )}%, var(--card))`;
  const showColumnHighlight = columnHighlighted && ratio > 0;
  const muteColumn =
    anyColumnHighlighted && !columnHighlighted && ratio > 0;
  const trialLinks = (outcome.trials ?? []).filter(
    (trial): trial is LeaderboardTrialLink & { job: string } =>
      typeof trial.job === 'string' && trial.job.length > 0,
  );
  // Without trial ids (public read), fall back to the Hub row page.
  const fallbackUrl = harborLeaderboardRowUrl(
    TERMINAL_BENCH_PACKAGE,
    TERMINAL_BENCH_LEADERBOARD,
    rowId,
  );
  const summary = `${rowLabel} / ${task.slug}: ${outcome.solved}/${outcome.total} trials solved`;
  const cellStyle = {
    '--matrix-cell-background': showColumnHighlight
      ? hoverBackgroundColor
      : backgroundColor,
    color:
      showColumnHighlight && strength >= 50
        ? contrastColor(taskAccentColor)
        : strength >= 50
          ? contrastColor(accentColor)
          : 'var(--foreground)',
    filter: muteColumn ? 'grayscale(1)' : undefined,
    opacity: muteColumn ? 0.4 : 1,
  } as CSSProperties;
  const cellClassName =
    'h-11 w-11 min-w-11 max-w-11 border-r border-b bg-[var(--matrix-cell-background)] p-0 text-center text-[10px] font-medium tabular-nums transition-colors';
  const buttonClassName =
    'flex h-full w-full cursor-pointer items-center justify-center hover:ring-1 hover:ring-inset hover:ring-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground';

  if (trialLinks.length === 0) {
    return (
      <td title={`${summary} — open on Harbor Hub`} className={cellClassName} style={cellStyle}>
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonClassName}
        >
          {outcome.solved}/{outcome.total}
        </a>
      </td>
    );
  }

  return (
    <td title={summary} className={cellClassName} style={cellStyle}>
      <Popover>
        <PopoverTrigger
          render={<button type="button" className={buttonClassName} />}
        >
          {outcome.solved}/{outcome.total}
        </PopoverTrigger>
        <PopoverContent align="center" className="w-auto min-w-48 gap-2 p-3 text-xs">
          <div className="min-w-0">
            <p className="truncate font-medium">{rowLabel}</p>
            <p className="truncate text-muted-foreground">{task.slug}</p>
          </div>
          <ul className="flex flex-col gap-1">
            {trialLinks.map((trial, index) => (
              <li key={trial.id}>
                <a
                  href={harborTrialUrl(trial.job, trial.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 rounded-sm px-1.5 py-1 tabular-nums hover:bg-muted"
                >
                  <span>Trial {index + 1}</span>
                  <span
                    className={
                      trial.solved ? 'text-foreground' : 'text-muted-foreground'
                    }
                  >
                    {trial.solved ? 'solved' : 'failed'} ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </td>
  );
}

function TaskHeader({
  task,
  columnHighlighted,
  onColumnHover,
}: {
  task: LeaderboardMatrixTask;
  columnHighlighted: boolean;
  onColumnHover: (taskId: string | null) => void;
}) {
  const domain = getDomain(task.domain);
  const label = task.slug.split('/').at(-1) ?? task.slug;
  return (
    <th
      scope="col"
      className="group relative h-56 w-11 min-w-11 max-w-11 overflow-visible border-b p-0 align-bottom"
      style={{ '--task-label-accent': domain.color } as CSSProperties}
      onMouseEnter={() => onColumnHover(task.id)}
      onMouseLeave={() => onColumnHover(null)}
    >
      <a
        data-matrix-task-label
        href={harborTaskUrl(TERMINAL_BENCH_PACKAGE, task.slug)}
        target="_blank"
        rel="noreferrer"
        title={`${task.slug} / ${domain.title} — open on Harbor Hub`}
        className="absolute bottom-3 left-1/2 z-10 block origin-bottom-left -rotate-[58deg] text-[10px] leading-none font-medium whitespace-nowrap text-foreground uppercase transition-colors hover:underline focus-visible:underline focus-visible:outline-none"
        style={{
          color: columnHighlighted ? domain.color : undefined,
        }}
      >
        {label}
      </a>
    </th>
  );
}

function escapeTsv(value: string): string {
  return value.replaceAll('\t', ' ').replaceAll('\r', ' ').replaceAll('\n', ' ');
}


function matrixTotals(
  outcomes: Record<string, LeaderboardTaskOutcome>,
  tasks: LeaderboardMatrixTask[],
): { solved: number; total: number } {
  return tasks.reduce(
    (result, task) => {
      const outcome = outcomes[task.id];
      if (outcome) {
        result.solved += outcome.solved;
        result.total += outcome.total;
      }
      return result;
    },
    { solved: 0, total: 0 },
  );
}

function matrixResolutionRate(
  outcomes: Record<string, LeaderboardTaskOutcome>,
  tasks: LeaderboardMatrixTask[],
): number | null {
  const totals = matrixTotals(outcomes, tasks);
  return totals.total > 0 ? (totals.solved / totals.total) * 100 : null;
}

/**
 * Standard error of the resolution rate in percentage points, the same
 * binomial estimate the Hub publishes for the leaderboard (n = visible trials).
 */
function matrixResolutionStderr(
  outcomes: Record<string, LeaderboardTaskOutcome>,
  tasks: LeaderboardMatrixTask[],
): number | null {
  const totals = matrixTotals(outcomes, tasks);
  if (totals.total === 0) return null;
  const p = totals.solved / totals.total;
  return Math.sqrt((p * (1 - p)) / totals.total) * 100;
}

function numericMetric(row: LeaderboardRow, accessor: string): number {
  const value = getAccessorValue(row, accessor);
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : Number.POSITIVE_INFINITY;
}

function compareMetric(
  left: LeaderboardRow,
  right: LeaderboardRow,
  accessor: string,
): number {
  const leftValue = numericMetric(left, accessor);
  const rightValue = numericMetric(right, accessor);
  return leftValue === rightValue ? 0 : leftValue - rightValue;
}

function matrixToTsv(
  rows: LeaderboardRow[],
  tasks: LeaderboardMatrixTask[],
  outcomes: LeaderboardTaskMatrix['rows'],
  domain: DomainId,
): string {
  const header = [
    'Model',
    'Agent',
    'Resolution Rate (%)',
    'Std. error (± pp)',
    ...tasks.map((task) => task.slug),
  ];
  const lines = rows.map((row) => {
    const label = chartRowLabel(row);
    const rowOutcomes = outcomes[row.id] ?? {};
    const resolutionRate = matrixResolutionRate(rowOutcomes, tasks);
    const ci95 = matrixResolutionStderr(rowOutcomes, tasks);
    return [
      escapeTsv(label.model),
      escapeTsv(label.agent),
      resolutionRate == null ? '' : resolutionRate.toFixed(2),
      ci95 == null ? '' : ci95.toFixed(2),
      ...tasks.map((task) => {
        const outcome = rowOutcomes[task.id];
        return outcome ? `${outcome.solved}/${outcome.total}` : '';
      }),
    ];
  });

  return [
    [domainExportTitle(domain, 'Task Matrix')],
    [],
    header,
    ...lines,
  ]
    .map((line) => line.join('\t'))
    .join('\n');
}

function CopyMatrixActions({
  rows,
  tasks,
  outcomes,
  domain,
  accentColor,
}: {
  rows: LeaderboardRow[];
  tasks: LeaderboardMatrixTask[];
  outcomes: LeaderboardTaskMatrix['rows'];
  domain: DomainId;
  accentColor: string;
}) {
  async function prepareImage(): Promise<PreparedExportImage | null> {
    const matrix = document.getElementById(MATRIX_IMAGE_ID);
    const scrollRegion = document.getElementById(MATRIX_SCROLL_ID);
    const table = scrollRegion?.querySelector('table');
    if (!matrix || !scrollRegion || !table) return null;

    const { element: exportMatrix, remove } = createExportClone(matrix);
    const exportScrollRegion = exportMatrix.querySelector<HTMLElement>(
      `#${MATRIX_SCROLL_ID}`,
    );
    const exportTable = exportScrollRegion?.querySelector('table');
    if (!exportScrollRegion || !exportTable) {
      remove();
      throw new Error('Could not prepare matrix image.');
    }

    try {
      await waitForExportImages(exportMatrix);
      exportScrollRegion.scrollLeft = 0;
      exportScrollRegion.style.maxHeight = 'none';
      exportScrollRegion.style.overflow = 'visible';
      exportMatrix.style.maxWidth = 'none';
      exportMatrix.style.overflow = 'visible';
      const exportHeader = exportMatrix.querySelector<HTMLElement>('header');
      const exportLogo =
        exportHeader?.querySelector<HTMLElement>('[data-export-logo]');
      const exportTitle = exportHeader?.firstElementChild as HTMLElement | null;
      if (exportHeader && exportLogo) {
        exportHeader.style.position = 'relative';
        exportHeader.style.flexWrap = 'nowrap';
        exportHeader.style.minHeight = '52px';
        exportLogo.style.position = 'absolute';
        exportLogo.style.top = '10px';
        exportLogo.style.right = '16px';
        if (exportTitle) exportTitle.style.paddingRight = '184px';
      }
      for (const element of exportMatrix.querySelectorAll<HTMLElement>(
        '[data-matrix-sticky]',
      )) {
        element.style.position = 'static';
      }

      await new Promise<void>((resolve) =>
        window.requestAnimationFrame(() => resolve()),
      );
      const matrixLeft = exportMatrix.getBoundingClientRect().left;
      const contentRight = Math.max(
        exportTable.getBoundingClientRect().right,
        ...[
          ...exportMatrix.querySelectorAll<HTMLElement>(
            '[data-matrix-task-label]',
          ),
        ].map((label) => label.getBoundingClientRect().right),
      );
      exportMatrix.style.width = `${Math.ceil(contentRight - matrixLeft) + 2}px`;
    } catch (error) {
      remove();
      throw error;
    }

    return {
      element: exportMatrix,
      options: {
        backgroundColor: window.getComputedStyle(exportMatrix).backgroundColor,
        cacheBust: true,
        pixelRatio: highResolutionExportScale(exportMatrix),
        width: exportMatrix.scrollWidth,
        height: exportMatrix.scrollHeight,
      },
      cleanup: remove,
    };
  }

  return (
    <ViewExportMenu
      fileBaseName={`terminal-bench-science-${domain}-matrix`}
      getTsv={() => matrixToTsv(rows, tasks, outcomes, domain)}
      prepareImage={prepareImage}
      accentColor={accentColor}
    />
  );
}

export function MatrixView({ domain }: { domain: DomainId }) {
  const domainDefinition = getDomain(domain);
  const DomainIcon = DOMAIN_ICONS[domain];
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const { data, error, isPending } = useQuery({
    queryKey: leaderboardQueryKey(
      TERMINAL_BENCH_PACKAGE,
      TERMINAL_BENCH_LEADERBOARD,
    ),
    queryFn: () =>
      fetchLeaderboard(TERMINAL_BENCH_PACKAGE, TERMINAL_BENCH_LEADERBOARD),
  });
  const domainRows = useMemo(
    () => (data ? projectLeaderboardRowsToDomain(data.rows, domain) : []),
    [data, domain],
  );
  const facets = useMemo(() => {
    if (!data) {
      return { numberBounds: {}, dateBounds: {}, setOptions: {} };
    }
    return buildFilterFacets(data.leaderboard.columns, domainRows);
  }, [data, domainRows]);
  const [urlFilters, setUrlFilters] = useQueryState(
    'filters',
    leaderboardFiltersParser,
  );
  const filters = useMemo(
    () => fromUrlFilters(urlFilters, facets.numberBounds),
    [facets.numberBounds, urlFilters],
  );
  const filteredRows = useMemo(() => {
    if (!data) return [];
    return applyLeaderboardFilters(
      domainRows,
      data.leaderboard.columns,
      filters,
      facets.numberBounds,
    );
  }, [data, domainRows, facets.numberBounds, filters]);
  const tasks = useMemo(
    () =>
      (data?.task_matrix?.tasks ?? []).filter(
        (task) => domain === 'all' || task.domain === domain,
      ),
    [data, domain],
  );
  const anyColumnHighlighted = hoveredTaskId !== null;
  const matrixRows = useMemo(() => {
    const outcomes = data?.task_matrix?.rows ?? {};
    return [...filteredRows].sort((left, right) => {
      const leftRate =
        matrixResolutionRate(outcomes[left.id] ?? {}, tasks) ?? -1;
      const rightRate =
        matrixResolutionRate(outcomes[right.id] ?? {}, tasks) ?? -1;
      const rateDelta = rightRate - leftRate;
      if (rateDelta !== 0) return rateDelta;

      const costDelta = compareMetric(
        left,
        right,
        'metrics.total_cost_usd',
      );
      if (costDelta !== 0) return costDelta;

      const tokenDelta = compareMetric(left, right, 'metrics.total_tokens');
      return tokenDelta || left.id.localeCompare(right.id);
    });
  }, [data, filteredRows, tasks]);

  function handleFiltersChange(next: LeaderboardFilters) {
    void setUrlFilters(toUrlFilters(next, facets.numberBounds));
  }

  function handleColumnHover(taskId: string | null) {
    setHoveredTaskId(taskId);
  }

  const toolbar = (
    <LeaderboardToolbar
      columns={data?.leaderboard.columns ?? []}
      columnOptions={[]}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      numberBounds={facets.numberBounds}
      dateBounds={facets.dateBounds}
      setOptions={facets.setOptions}
      columnVisibility={{}}
      onColumnVisibilityChange={() => {}}
      accentColor={domainDefinition.color}
      showColumnControls={false}
    />
  );

  if (isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-end">{toolbar}</div>
        <div className="-mx-4 rounded-none border border-x-0 px-4 py-10 text-center text-sm text-muted-foreground md:mx-0 md:rounded-xl md:border-x">
          Loading task matrix…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-end">{toolbar}</div>
        <div className="-mx-4 rounded-none border border-x-0 border-destructive/30 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive md:mx-0 md:rounded-xl md:border-x">
          {error?.message ?? 'Failed to load task matrix'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <CopyMatrixActions
          rows={matrixRows}
          tasks={tasks}
          outcomes={data.task_matrix?.rows ?? {}}
          domain={domain}
          accentColor={domainDefinition.color}
        />
        {toolbar}
      </div>
      <div
        id={MATRIX_IMAGE_ID}
        className="-mx-4 min-w-0 overflow-hidden rounded-none border border-x-0 bg-card md:mx-0 md:rounded-xl md:border-x"
      >
        <ViewHeader
          title={
            <>
              Terminal-Bench-Science 0.1 Task Matrix
              {domain !== 'all' ? (
                <>
                  {' / '}
                  <span data-export-domain-accent={domainDefinition.color}>
                    {domainDefinition.title}
                  </span>
                </>
              ) : null}
            </>
          }
          icon={
            <DomainIcon
              className="size-4"
              strokeWidth={2}
              aria-hidden
              style={{ color: domainDefinition.color }}
            />
          }
          exportIcon={domain !== 'all'}
        />
        {tasks.length === 0 || matrixRows.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted-foreground">
            No matrix results match the current domain and filters.
          </p>
        ) : (
          <div
            id={MATRIX_SCROLL_ID}
            className="overflow-auto"
          >
            <table
              className="table-fixed border-separate border-spacing-0"
              style={{ width: 288 + tasks.length * 44 + 80 }}
            >
              <thead
                data-matrix-sticky
                className="sticky top-0 z-20 bg-card"
              >
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-30 w-72 min-w-72 max-w-72 border-r border-b bg-sidebar px-4 py-3 text-left align-bottom text-xs font-medium text-muted-foreground uppercase"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>Model / Agent</span>
                      <span>Resolution Rate</span>
                    </span>
                  </th>
                  {tasks.map((task) => (
                    <TaskHeader
                      key={task.id}
                      task={task}
                      columnHighlighted={hoveredTaskId === task.id}
                      onColumnHover={handleColumnHover}
                    />
                  ))}
                  <th
                    aria-hidden="true"
                    className="h-56 w-20 min-w-20 border-b"
                  />
                </tr>
              </thead>
              <tbody>
                {matrixRows.map((row) => {
                  const label = chartRowLabel(row);
                  const outcomes = data.task_matrix?.rows[row.id] ?? {};
                  const resolutionRate = matrixResolutionRate(outcomes, tasks);
                  const ci95 = matrixResolutionStderr(outcomes, tasks);
                  return (
                    <tr key={row.id} className="group">
                      <th
                        data-matrix-sticky
                        scope="row"
                        title={label.full}
                        className="sticky left-0 z-10 w-72 min-w-72 max-w-72 border-r border-b bg-card px-4 py-2 text-left group-hover:bg-muted"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="block max-w-48 truncate text-xs font-medium">
                            {label.model}
                            {label.reasoningEffort ? (
                              <span className="font-normal text-muted-foreground">
                                {' '}({label.reasoningEffort})
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 text-xs font-medium tabular-nums">
                            {resolutionRate == null
                              ? '—'
                              : `${resolutionRate.toFixed(1)}%`}
                          </span>
                        </span>
                        <span className="flex items-center justify-between gap-3">
                          <span className="block max-w-40 truncate text-[10px] font-normal text-muted-foreground">
                            {label.agent ?? ''}
                          </span>
                          <span className="shrink-0 text-[10px] font-normal tabular-nums text-muted-foreground">
                            {ci95 == null ? '' : `± ${ci95.toFixed(1)}%`}
                          </span>
                        </span>
                      </th>
                      {tasks.map((task) => (
                        <MatrixCell
                          key={task.id}
                          outcome={outcomes[task.id]}
                          accentColor={domainDefinition.color}
                          task={task}
                          rowId={row.id}
                          rowLabel={label.full}
                          columnHighlighted={hoveredTaskId === task.id}
                          anyColumnHighlighted={anyColumnHighlighted}
                        />
                      ))}
                      <td
                        aria-hidden="true"
                        className="w-20 min-w-20 border-b bg-card"
                      />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <ViewDescriptionBar>
          Resolution rates for individual tasks. Click a task name to open
          it on the Harbor Hub, or a cell to open its trials.
        </ViewDescriptionBar>
      </div>
    </div>
  );
}
