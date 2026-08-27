/**
 * Snapshot of the Terminal-Bench-Science 0.1 leaderboard for the announcement.
 *
 * Exported from Harbor Hub (`v0-1-eval`) on August 26, 2026. This stays static so the
 * announcement preserves the results available at release time.
 */

export type ScienceAnnouncementLeaderboardEntry = {
  rank: number;
  status: 'display' | 'hide';
  model: string;
  agent: string;
  accuracy: number;
  accuracyStderr: number;
};

export const SCIENCE_ANNOUNCEMENT_LEADERBOARD_UPDATED_AT =
  '2026-08-26T17:24:06.600744+00:00';

export const SCIENCE_ANNOUNCEMENT_LEADERBOARD_SNAPSHOT: readonly ScienceAnnouncementLeaderboardEntry[] =
  [
    {
      rank: 1,
      status: 'display',
      model: 'Claude Opus 5',
      agent: 'Claude Code',
      accuracy: 30,
      accuracyStderr: 3.162277660168379,
    },
    {
      rank: 2,
      status: 'display',
      model: 'GPT-5.6 Sol',
      agent: 'Codex',
      accuracy: 22.380952380952383,
      accuracyStderr: 2.876164947101791,
    },
    {
      rank: 3,
      status: 'display',
      model: 'Claude Fable 5',
      agent: 'Claude Code',
      accuracy: 21.428571428571427,
      accuracyStderr: 2.831517739900328,
    },
    {
      rank: 4,
      status: 'display',
      model: 'Claude Opus 4.8',
      agent: 'Claude Code',
      accuracy: 10.476190476190476,
      accuracyStderr: 2.1133008267654967,
    },
    {
      rank: 5,
      status: 'display',
      model: 'GPT-5.6 Terra',
      agent: 'Codex',
      accuracy: 8.571428571428571,
      accuracyStderr: 1.9317811536651808,
    },
    {
      rank: 6,
      status: 'display',
      model: 'GLM 5.3',
      agent: 'Claude Code',
      accuracy: 8.095238095238095,
      accuracyStderr: 1.8822364227102866,
    },
    {
      rank: 7,
      status: 'display',
      model: 'Kimi K3',
      agent: 'Claude Code',
      accuracy: 7.142857142857142,
      accuracyStderr: 1.7771905411718545,
    },
    {
      rank: 8,
      status: 'display',
      model: 'Grok 4.6',
      agent: 'Grok Build',
      accuracy: 7.142857142857142,
      accuracyStderr: 1.7771905411718545,
    },
    {
      rank: 9,
      status: 'display',
      model: 'GPT-5.6 Luna',
      agent: 'Codex',
      accuracy: 3.3333333333333335,
      accuracyStderr: 1.2387055882620108,
    },
  ] as const;
