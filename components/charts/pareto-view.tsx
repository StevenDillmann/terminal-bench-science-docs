"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";

import {
  DEFAULT_PARETO_X,
  DEFAULT_PARETO_Y,
  PARETO_AXES,
  PARETO_X_AXIS_IDS,
  isParetoXAxisId,
} from "@/components/charts/pareto-axes";
import {
  ParetoScatterChart,
  buildParetoData,
  type ParetoDatum,
} from "@/components/charts/pareto-scatter-chart";
import {
  applyLeaderboardFilters,
  buildFilterFacets,
  LeaderboardToolbar,
  type LeaderboardFilters,
} from "@/components/leaderboard/leaderboard-toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewDescriptionBar } from "@/components/view-description-bar";
import { ViewHeader } from "@/components/view-header";
import {
  TERMINAL_BENCH_LEADERBOARD,
  TERMINAL_BENCH_PACKAGE,
  fetchLeaderboard,
  formatLeaderboardCell,
  leaderboardQueryKey,
  projectLeaderboardRowsToDomain,
} from "@/lib/leaderboard";
import {
  domainExportTitle,
  domainTaskCount,
  getDomain,
  type DomainId,
} from "@/lib/domain-context";
import { DOMAIN_ICONS } from "@/lib/domain-icons";
import { ViewTitle } from "@/components/view-title";
import {
  createExportClone,
  highResolutionExportScale,
  waitForExportImages,
} from "@/lib/export-view";
import {
  type PreparedExportImage,
  ViewExportMenu,
} from "@/components/view-export-menu";
import {
  fromUrlFilters,
  leaderboardFiltersParser,
  toUrlFilters,
} from "@/lib/leaderboard-url-state";

const parseParetoXAxis = parseAsStringLiteral(PARETO_X_AXIS_IDS);
const PARETO_IMAGE_ID = "pareto-chart-image";
/** Error bars and exports show one standard error. */
const ERROR_BAR_MULTIPLIER = 1;
const SVG_CAPTURE_PROPERTIES = [
  "color",
  "fill",
  "font-family",
  "font-size",
  "font-weight",
  "opacity",
  "stroke",
  "stroke-width",
] as const;

function resolveCaptureColor(
  value: string,
  context: CanvasRenderingContext2D,
): string {
  if (!value || value === "none" || value === "currentcolor") return value;
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = "rgb(1, 2, 3)";
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  if (red === 1 && green === 2 && blue === 3 && alpha === 255) return value;
  return `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
}

function inlineParetoSvgStyles(chart: HTMLElement): {
  backgroundColor?: string;
  restore: () => void;
} {
  const svg = chart.querySelector<SVGSVGElement>('svg[role="img"]');
  if (!svg) return { restore: () => {} };

  const context = document.createElement("canvas").getContext("2d");
  const cardBackground = window.getComputedStyle(chart).backgroundColor;

  const elements = [svg, ...svg.querySelectorAll<SVGElement>("*")];
  const originalStyles = elements.map((element) => ({
    element,
    style: element.getAttribute("style"),
  }));

  for (const element of elements) {
    const styles = window.getComputedStyle(element);
    for (const property of SVG_CAPTURE_PROPERTIES) {
      const value = styles.getPropertyValue(property);
      element.style.setProperty(
        property,
        context && ["color", "fill", "stroke"].includes(property)
          ? resolveCaptureColor(value, context)
          : value,
      );
    }
  }

  const isDark = document.documentElement.classList.contains("dark");
  const foreground = isDark ? "#fafafa" : "#0a0a0a";
  const mutedForeground = isDark ? "#a1a1aa" : "#71717a";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
  const axisColor = isDark
    ? "rgba(161, 161, 170, 0.65)"
    : "rgba(82, 82, 91, 0.65)";
  const mutedPoint = isDark
    ? "rgba(161, 161, 170, 0.35)"
    : "rgba(82, 82, 91, 0.35)";

  for (const element of svg.querySelectorAll<SVGElement>("*")) {
    const className = element.getAttribute("class") ?? "";
    if (className.includes("stroke-border")) {
      element.style.stroke = gridColor;
      element.style.strokeWidth = "1";
    }
    if (className.includes("stroke-muted-foreground")) {
      element.style.stroke = axisColor;
      element.style.strokeWidth = "1.25";
    }
    if (className.includes("fill-foreground")) {
      element.style.fill = foreground;
    }
    if (className.includes("fill-muted-foreground/35")) {
      element.style.fill = mutedPoint;
    } else if (className.includes("fill-muted-foreground")) {
      element.style.fill = mutedForeground;
    }
  }

  return {
    backgroundColor: context
      ? resolveCaptureColor(cardBackground ?? "", context)
      : cardBackground,
    restore: () => {
      for (const { element, style } of originalStyles) {
        if (style == null) {
          element.removeAttribute("style");
        } else {
          element.setAttribute("style", style);
        }
      }
    },
  };
}

function paretoAxisHeader(axisId: keyof typeof PARETO_AXES): string {
  switch (axisId) {
    case "accuracy":
      return "Resolution Rate (%)";
    case "cost":
      return "Cost (USD)";
    case "tokens":
      return "Tokens";
    case "release_date":
      return "Release Date";
  }
}

function paretoValueForExport(
  value: number,
  axisId: keyof typeof PARETO_AXES,
): string {
  if (axisId === "release_date") {
    return new Date(value).toISOString().slice(0, 10);
  }
  return formatLeaderboardCell(value, "number");
}

function formatConfidenceInterval(point: ParetoDatum): string {
  if (point.accuracyStderr == null) return "—";
  return (ERROR_BAR_MULTIPLIER * point.accuracyStderr).toFixed(2);
}

function paretoDataToTsv(
  data: ParetoDatum[],
  xAxisId: keyof typeof PARETO_AXES,
  yAxisId: keyof typeof PARETO_AXES,
  domain: DomainId,
): string {
  const header = [
    "Model",
    "Agent",
    paretoAxisHeader(yAxisId),
    ...(yAxisId === "accuracy" ? ["Std. error (± pp)"] : []),
    paretoAxisHeader(xAxisId),
    "Pareto Frontier",
  ];
  const rows = data.map((point) => [
    point.label.model,
    point.label.agent,
    paretoValueForExport(point.y, yAxisId),
    ...(yAxisId === "accuracy" ? [formatConfidenceInterval(point)] : []),
    paretoValueForExport(point.x, xAxisId),
    point.onFrontier ? "Yes" : "No",
  ]);
  const curveTitle = `${PARETO_AXES[yAxisId].label} vs. ${PARETO_AXES[xAxisId].label}`;

  return [
    [`${domainExportTitle(domain, "Pareto Data")} (${curveTitle})`],
    [],
    header,
    ...rows,
  ]
    .map((line) => line.join("\t"))
    .join("\n");
}

function CopyParetoActions({
  data,
  xAxisId,
  yAxisId,
  domain,
  accentColor,
}: {
  data: ParetoDatum[];
  xAxisId: keyof typeof PARETO_AXES;
  yAxisId: keyof typeof PARETO_AXES;
  domain: DomainId;
  accentColor: string;
}) {
  async function prepareImage(): Promise<PreparedExportImage | null> {
    const chart = document.getElementById(PARETO_IMAGE_ID);
    if (!chart) return null;

    const { element: exportChart, remove } = createExportClone(chart);
    const { backgroundColor, restore } = inlineParetoSvgStyles(exportChart);
    await waitForExportImages(exportChart);
    return {
      element: exportChart,
      options: {
        backgroundColor,
        cacheBust: true,
        pixelRatio: highResolutionExportScale(exportChart),
        filter: (node) =>
          !(node instanceof Element && node.hasAttribute("data-export-ignore")),
      },
      cleanup: () => {
        restore();
        remove();
      },
    };
  }

  return (
    <ViewExportMenu
      fileBaseName={`terminal-bench-science-${domain}-pareto`}
      getTsv={() => paretoDataToTsv(data, xAxisId, yAxisId, domain)}
      prepareImage={prepareImage}
      accentColor={accentColor}
    />
  );
}

export function ParetoView({ domain }: { domain: DomainId }) {
  const domainDefinition = getDomain(domain);
  const DomainIcon = DOMAIN_ICONS[domain];
  const [xAxisId, setXAxisId] = useQueryState(
    "x",
    parseParetoXAxis.withDefault(DEFAULT_PARETO_X),
  );

  const yAxisId = DEFAULT_PARETO_Y;

  const { data, error, isPending } = useQuery({
    queryKey: leaderboardQueryKey(
      TERMINAL_BENCH_PACKAGE,
      TERMINAL_BENCH_LEADERBOARD,
    ),
    queryFn: () =>
      fetchLeaderboard(TERMINAL_BENCH_PACKAGE, TERMINAL_BENCH_LEADERBOARD),
  });

  const taskCount = useMemo(
    () => domainTaskCount(data?.task_matrix?.tasks, domain),
    [data, domain],
  );

  const domainRows = useMemo(
    () => (data ? projectLeaderboardRowsToDomain(data.rows, domain) : []),
    [data, domain],
  );

  const facets = useMemo(() => {
    if (!data) {
      return {
        numberBounds: {},
        dateBounds: {},
        setOptions: {},
      };
    }
    return buildFilterFacets(data.leaderboard.columns, domainRows);
  }, [data, domainRows]);
  const [urlFilters, setUrlFilters] = useQueryState(
    "filters",
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
  function handleFiltersChange(next: LeaderboardFilters) {
    void setUrlFilters(toUrlFilters(next, facets.numberBounds));
  }

  const chartData = useMemo(
    () => buildParetoData(filteredRows, xAxisId, yAxisId),
    [filteredRows, xAxisId, yAxisId],
  );

  const xLabel = PARETO_AXES[xAxisId].label;
  const yLabel = PARETO_AXES[yAxisId].label;
  const xMetricDescription =
    xAxisId === "cost"
      ? "total cost"
      : xAxisId === "tokens"
        ? "total token usage"
        : "model release date";

  if (isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-end">
          <LeaderboardToolbar
            columns={[]}
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
        </div>
        <div className="-mx-4 rounded-none border border-x-0 px-4 py-10 text-center text-sm text-muted-foreground md:mx-0 md:rounded-xl md:border-x">
          Loading Pareto…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-end">
          <LeaderboardToolbar
            columns={[]}
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
        </div>
        <div className="-mx-4 rounded-none border border-x-0 border-destructive/30 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive md:mx-0 md:rounded-xl md:border-x">
          {error?.message ?? "Failed to load Pareto data"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <CopyParetoActions
          data={chartData}
          xAxisId={xAxisId}
          yAxisId={yAxisId}
          domain={domain}
          accentColor={domainDefinition.color}
        />
        <LeaderboardToolbar
          columns={data.leaderboard.columns}
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
      </div>
      <div
        id={PARETO_IMAGE_ID}
        className="-mx-4 min-w-0 overflow-hidden rounded-none border border-x-0 bg-card md:mx-0 md:rounded-xl md:border-x"
      >
        <ViewHeader
          title={
            <ViewTitle
              view="Pareto Frontier"
              domain={domain}
              taskCount={taskCount}
            />
          }
          subtitle={`${yLabel} vs. ${xLabel}`}
          icon={
            <DomainIcon
              className="size-4"
              strokeWidth={2}
              aria-hidden
              style={{ color: domainDefinition.color }}
            />
          }
          exportIcon={domain !== "all"}
        />
        <ParetoScatterChart
          data={chartData}
          xAxisId={xAxisId}
          yAxisId={yAxisId}
          domain={domain}
          accentColor={domainDefinition.color}
          className="px-2 py-3"
          showNonFrontierLabels
        />
        <ViewDescriptionBar>
          <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>Resolution rate vs.</span>
            <span data-export-ignore className="inline-flex">
              <Select
                value={xAxisId}
                onValueChange={(next) => {
                  if (typeof next === "string" && isParetoXAxisId(next)) {
                    void setXAxisId(next);
                  }
                }}
              >
                <SelectTrigger
                  size="sm"
                  aria-label="X axis metric"
                  className="h-7 gap-1.5 bg-background px-2.5 text-xs font-medium uppercase tracking-[0.04em] text-foreground shadow-xs hover:bg-muted/60 dark:bg-card dark:hover:bg-muted/60"
                >
                  <SelectValue>{xLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent
                  side="top"
                  align="center"
                  alignItemWithTrigger={false}
                  collisionAvoidance={{ side: "none" }}
                >
                  {PARETO_X_AXIS_IDS.map((axisId) => (
                    <SelectItem key={axisId} value={axisId} className="text-xs">
                      {PARETO_AXES[axisId].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </span>
            <span data-export-only className="hidden">
              {xMetricDescription}
            </span>
          </span>
        </ViewDescriptionBar>
      </div>
    </div>
  );
}
