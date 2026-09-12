import { Atom } from "lucide-react";
import type { ReactNode } from "react";

import { CallLinks } from "@/components/call-links";
import {
  CONTRIBUTION_CALL,
  formatCalibrationModels,
  formatCallDeadline,
  formatCallDeadlineShort,
} from "@/lib/contribution-call";

const FORM_URL =
  "https://airtable.com/appzZC5gEHrXSfNNw/pagjgS95lAQ5FVJxt/form";
const CONTRIBUTING_URL =
  "https://github.com/harbor-framework/terminal-bench-science/blob/main/CONTRIBUTING.md";
const PULLS_URL =
  "https://github.com/harbor-framework/terminal-bench-science/pulls";
const FIX_REQUEST_URL =
  "https://github.com/harbor-framework/terminal-bench-science/issues/new?template=task-fix.yml";
const FIX_REQUESTS_URL =
  "https://github.com/harbor-framework/terminal-bench-science/issues?q=is%3Aissue+is%3Aopen+label%3A%22task+fix%22";

/** Inline: the release this round feeds into, e.g. "0.2". */
export function CallRelease() {
  return <>{CONTRIBUTION_CALL.release}</>;
}

/** Inline: the latest shipped release, e.g. "0.1". */
export function PreviousRelease() {
  return <>{CONTRIBUTION_CALL.previousRelease}</>;
}

/** Inline: the PR deadline as a date, e.g. "October 5, 2026". */
export function CallDeadline() {
  return (
    <time dateTime={CONTRIBUTION_CALL.deadline}>{formatCallDeadline()}</time>
  );
}

/** Inline: the calibration systems as prose, e.g. "Claude Fable 5.1 and GPT-6 Astra". */
export function CalibrationModels() {
  return <>{formatCalibrationModels()}</>;
}

function Step({
  index,
  label,
  detail,
  href,
}: {
  index: number;
  label: string;
  detail: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border bg-muted/40 px-3.5 py-2.5 transition-colors hover:bg-muted/70 dark:bg-background dark:hover:bg-muted/60"
    >
      <span className="flex items-baseline gap-2 text-sm font-medium tracking-[0.06em] uppercase">
        <span className="text-muted-foreground">
          {index}
        </span>
        <span>{label}</span>
      </span>
      <span className="text-[11px] text-muted-foreground">{detail}</span>
    </a>
  );
}

function Arrow() {
  return (
    <span
      aria-hidden
      className="hidden self-center text-muted-foreground sm:inline"
    >
      →
    </span>
  );
}

/**
 * The open round as a path: Propose → Pull request → Review & iterate,
 * ending at the PR deadline. Styled in the site's mono display face.
 */
export function CurrentCall(): ReactNode {
  return (
    <aside className="not-prose my-6 flex flex-col gap-5 rounded-xl border bg-card p-6 font-[family-name:var(--font-google-sans-code)]">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-medium tracking-[0.02em] uppercase">
            Contribute to Terminal-Bench-Science {CONTRIBUTION_CALL.release}
          </span>
          <span className="inline-flex items-center gap-1.5 text-base tracking-[0.04em] text-[#038f99] uppercase">
            <Atom className="size-4" strokeWidth={2} aria-hidden />
            Deadline{" "}
            <time dateTime={CONTRIBUTION_CALL.deadline}>
              {formatCallDeadlineShort()}
            </time>
          </span>
        </div>
        <CallLinks />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Step
          index={1}
          label="Propose"
          detail="Task Proposal Form"
          href={FORM_URL}
        />
        <Arrow />
        <Step
          index={2}
          label="Implement"
          detail="Pull Request"
          href={CONTRIBUTING_URL}
        />
        <Arrow />
        <Step
          index={3}
          label="Merge"
          detail="Review & Iterate"
          href={PULLS_URL}
        />
      </div>
      <p className="border-t pt-4 text-xs text-muted-foreground">
        Found a problem with a task in Terminal-Bench-Science{" "}
        {CONTRIBUTION_CALL.previousRelease}?{" "}
        <a
          href={FIX_REQUEST_URL}
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline decoration-muted-foreground/60 underline-offset-2 hover:decoration-foreground"
        >
          Submit a task fix request
        </a>
        {" "}
        and it reaches that task&apos;s author and reviewers, or see the{" "}
        <a
          href={FIX_REQUESTS_URL}
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline decoration-muted-foreground/60 underline-offset-2 hover:decoration-foreground"
        >
          open fix requests
        </a>
        .
      </p>
    </aside>
  );
}
