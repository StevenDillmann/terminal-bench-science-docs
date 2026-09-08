import defaultMdxComponents from "fumadocs-ui/mdx";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import type { MDXComponents } from "mdx/types";
import { Suspense, type ReactNode } from "react";

import { CostPassRateParetoChart } from "@/components/charts/cost-pass-rate-pareto-chart";
import {
  CostResolutionFrontier,
  TokenResolutionFrontier,
} from "@/components/charts/cost-resolution-frontier";
import { DiscriminationSlopeChart } from "@/components/charts/discrimination-slope-chart";
import { DomainRadarAnnouncement } from "@/components/charts/domain-radar-announcement";
import { PassRateBarChart } from "@/components/charts/pass-rate-bar-chart";
import { RoadmapDiagram } from "@/components/charts/roadmap-diagram";
import { ScienceFeedbackLoop } from "@/components/charts/science-feedback-loop";
import { TaskDomainCoverage } from "@/components/charts/task-domain-coverage";
import { TokensVsStepsChart } from "@/components/charts/tokens-vs-steps-chart";
import { ContributionsSection } from "@/components/contributions-section";
import {
  CalibrationModels,
  CallDeadline,
  CallRelease,
  CurrentCall,
  PreviousRelease,
} from "@/components/contribution-call";
import { CallLinks } from "@/components/call-links";
import { DomainTags } from "@/components/domain-tags";
import { FeaturedInLinks } from "@/components/featured-in";
import { HowToCite } from "@/components/how-to-cite";
import { MdxPre } from "@/components/mdx-codeblock";
import { VersionBlockClient } from "@/components/version-block";
import { DEFAULT_HOME_BENCHMARK_ID } from "@/lib/leaderboard";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    pre: MdxPre,
    VersionBlock: ({
      versions,
      children,
    }: {
      versions: string[];
      children: ReactNode;
    }) => (
      <Suspense
        fallback={
          versions.includes(DEFAULT_HOME_BENCHMARK_ID) ? children : null
        }
      >
        <VersionBlockClient versions={versions}>{children}</VersionBlockClient>
      </Suspense>
    ),
    PassRateBarChart,
    DiscriminationSlopeChart,
    DomainRadarAnnouncement,
    CostPassRateParetoChart,
    CostResolutionFrontier,
    TokenResolutionFrontier,
    TokensVsStepsChart,
    ContributionsSection,
    RoadmapDiagram,
    ScienceFeedbackLoop,
    TaskDomainCoverage,
    HowToCite,
    CallLinks,
    DomainTags,
    FeaturedInLinks,
    CurrentCall,
    CallRelease,
    CallDeadline,
    CalibrationModels,
    PreviousRelease,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
