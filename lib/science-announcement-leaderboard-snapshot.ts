/**
 * Snapshot of the Terminal-Bench-Science 0.1 leaderboard for the announcement.
 *
 * Exported from Harbor Hub on August 26, 2026. This stays static so the
 * announcement preserves the results available at release time.
 */

export type ScienceAnnouncementLeaderboardEntry = {
  rank: number;
  status: 'display' | 'hide';
  model: string;
  agent: string;
  accuracy: number;
};

export const SCIENCE_ANNOUNCEMENT_LEADERBOARD_UPDATED_AT =
  '2026-08-26T11:42:17.463749+00:00';

export const SCIENCE_ANNOUNCEMENT_LEADERBOARD_SNAPSHOT: readonly ScienceAnnouncementLeaderboardEntry[] =
  [
    {
      rank: 1,
      status: 'display',
      model: 'Claude Opus 5',
      agent: 'Claude Code',
      accuracy: 30,
    },
    {
      rank: 2,
      status: 'display',
      model: 'GPT-5.6 Sol',
      agent: 'Codex',
      accuracy: 22.380952380952383,
    },
    {
      rank: 3,
      status: 'display',
      model: 'Claude Fable 5',
      agent: 'Claude Code',
      accuracy: 21.428571428571427,
    },
    {
      rank: 4,
      status: 'display',
      model: 'Claude Opus 4.8',
      agent: 'Claude Code',
      accuracy: 10.476190476190476,
    },
    {
      rank: 5,
      status: 'display',
      model: 'GPT-5.6 Terra',
      agent: 'Codex',
      accuracy: 8.571428571428571,
    },
    {
      rank: 6,
      status: 'hide',
      model: 'GLM 5.3',
      agent: 'Claude Code',
      accuracy: 8.571428571428571,
    },
    {
      rank: 7,
      status: 'hide',
      model: 'Kimi K3',
      agent: 'Claude Code',
      accuracy: 7.142857142857142,
    },
    {
      rank: 8,
      status: 'hide',
      model: 'Grok 4.6',
      agent: 'Grok Build',
      accuracy: 7.142857142857142,
    },
    {
      rank: 9,
      status: 'display',
      model: 'GPT-5.6 Luna',
      agent: 'Codex',
      accuracy: 3.3333333333333335,
    },
  ] as const;
