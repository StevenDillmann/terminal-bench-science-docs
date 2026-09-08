/**
 * The current contribution round. Edit this file when a new round opens;
 * the Contribute page, its callout and every inline mention update together.
 */
export const CONTRIBUTION_CALL = {
  /** Release the round feeds into. */
  release: "0.2",
  /** Latest shipped release, for recaps. */
  previousRelease: "0.1",
  /** Pull request deadline, ISO date. */
  deadline: "2026-10-05",
  /** Frontier systems tasks are calibrated against. */
  calibrationModels: ["Claude Fable 5.1", "GPT-6 Astra"],
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

export function formatCallDeadline(): string {
  return deadlineFormatter.format(new Date(CONTRIBUTION_CALL.deadline));
}

/** "A and B" / "A, B, and C". */
export function formatCalibrationModels(): string {
  const models = CONTRIBUTION_CALL.calibrationModels;
  if (models.length <= 1) return models.join("");
  if (models.length === 2) return `${models[0]} and ${models[1]}`;
  return `${models.slice(0, -1).join(", ")}, and ${models[models.length - 1]}`;
}
