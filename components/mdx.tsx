import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';

import { CostPassRateParetoChart } from '@/components/charts/cost-pass-rate-pareto-chart';
import {
  CostResolutionFrontier,
  TokenResolutionFrontier,
} from '@/components/charts/cost-resolution-frontier';
import { DiscriminationSlopeChart } from '@/components/charts/discrimination-slope-chart';
import { DomainRadarAnnouncement } from '@/components/charts/domain-radar-announcement';
import { PassRateBarChart } from '@/components/charts/pass-rate-bar-chart';
import { RoadmapDiagram } from '@/components/charts/roadmap-diagram';
import { ScienceFeedbackLoop } from '@/components/charts/science-feedback-loop';
import { TaskDomainCoverage } from '@/components/charts/task-domain-coverage';
import { TokensVsStepsChart } from '@/components/charts/tokens-vs-steps-chart';
import { ContributorGeographyMap } from '@/components/contributor-geography-map';
import { MdxPre } from '@/components/mdx-codeblock';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    pre: MdxPre,
    PassRateBarChart,
    DiscriminationSlopeChart,
    DomainRadarAnnouncement,
    CostPassRateParetoChart,
    CostResolutionFrontier,
    TokenResolutionFrontier,
    TokensVsStepsChart,
    RoadmapDiagram,
    ScienceFeedbackLoop,
    TaskDomainCoverage,
    ContributorGeographyMap,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
