/** Site teal (matches other announcement charts). */
export const PROPOSAL_FUNNEL_ACCENT = '#038f99';

/**
 * Contribution funnel for the announcement page.
 *
 * Snapshot aligned with the Tasks section copy (August 2026).
 */
export type ProposalFunnelStage = {
  id: string;
  label: string;
  count: number;
};

export const PROPOSAL_FUNNEL_STAGES: readonly ProposalFunnelStage[] = [
  { id: 'proposals', label: 'Task Proposals', count: 920 },
  { id: 'approved-proposals', label: 'Approved proposals', count: 464 },
  { id: 'implementation-prs', label: 'Task Pull Requests', count: 386 },
  { id: 'tasks', label: 'Accepted Tasks', count: 70 },
] as const;

export const PROPOSAL_FUNNEL_MAX = 1000;
