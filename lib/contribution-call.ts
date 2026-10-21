/**
 * Release roadmap, oldest first. Edit this list when a round opens, closes or
 * ships; the Contribute page's call card, its roadmap strip and every inline
 * mention update together. Status is set by hand rather than derived from
 * today's date, because the site is static and a build-time "now" goes stale.
 *
 * - `released`: shipped; `date` is the release date.
 * - `closed`:   submissions closed, release in preparation; `date` is the PR deadline.
 * - `open`:     the current round; `date` is the PR deadline. Exactly one.
 */
export type RoadmapStatus = "released" | "closed" | "open";
export type RoadmapEntry = {
  release: string;
  status: RoadmapStatus;
  /** ISO date: release date when released, else the PR deadline. */
  date: string;
  /** Frontier systems the release's tasks are calibrated against. */
  calibrationModels: readonly string[];
  /** One or two sentences on what the release holds, for the roadmap timeline. */
  summary: string;
  /** Write-up of a shipped release. */
  announcement?: string;
};

export const ROADMAP: readonly RoadmapEntry[] = [
  {
    release: "0.1",
    status: "released",
    date: "2026-08-27",
    calibrationModels: ["Claude Opus 5", "GPT-5.6 Sol"],
    summary:
      "70 tasks across the life, physical, earth, mathematical, and engineering sciences, selected from 920 proposals. The strongest system, Claude Opus 5, resolves 30%.",
    announcement: "/announcement",
  },
  {
    release: "0.2",
    status: "closed",
    date: "2026-10-13",
    calibrationModels: ["Claude Opus 5.5", "GPT-6 Astra"],
    summary:
      "Pull requests opened before the deadline are finishing review, and the release is in preparation.",
  },
  {
    release: "1.0",
    status: "open",
    date: "2026-12-15",
    calibrationModels: ["Claude Opus 5.5", "GPT-6 Astra"],
    summary:
      "Open for new tasks now. Propose a workflow, build it as a pull request, and iterate with reviewers before the deadline.",
  },
];

/** What follows the listed releases, closing the roadmap timeline. */
export const ROADMAP_NEXT =
  "Regular releases continue after 1.0, adding new tasks and keeping the leaderboard current.";

const openRound = ROADMAP.find((r) => r.status === "open")!;
const lastReleased = [...ROADMAP].reverse().find((r) => r.status === "released")!;

/** The current contribution round, derived from ROADMAP. */
export const CONTRIBUTION_CALL = {
  /** Release the round feeds into. */
  release: openRound.release,
  /** Latest shipped release, for recaps. */
  previousRelease: lastReleased.release,
  /** Pull request deadline, ISO date. */
  deadline: openRound.date,
  /** Frontier systems tasks are calibrated against. */
  calibrationModels: openRound.calibrationModels,
} as const;

const deadlineFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const shortDeadlineFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** "Oct 5, 2026" */
export function formatCallDeadlineShort(): string {
  return shortDeadlineFormatter.format(new Date(CONTRIBUTION_CALL.deadline));
}

/** Any ISO date in the short form, e.g. "Aug 27, 2026". */
export function formatShortDate(iso: string): string {
  return shortDeadlineFormatter.format(new Date(iso));
}

/** What a roadmap entry's date means, e.g. "Released", "Closed", "Deadline". */
export const ROADMAP_STATUS_LABEL: Record<RoadmapStatus, string> = {
  released: "Released",
  closed: "Closed",
  open: "Deadline",
};

export function formatCallDeadline(): string {
  return deadlineFormatter.format(new Date(CONTRIBUTION_CALL.deadline));
}

/** "A and B" / "A, B, and C"; the open round's systems by default. */
export function formatCalibrationModels(
  models: readonly string[] = CONTRIBUTION_CALL.calibrationModels,
): string {
  if (models.length <= 1) return models.join("");
  if (models.length === 2) return `${models[0]} and ${models[1]}`;
  return `${models.slice(0, -1).join(", ")}, and ${models[models.length - 1]}`;
}
