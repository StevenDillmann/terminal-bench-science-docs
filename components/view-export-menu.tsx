"use client";

import {
  Link02Icon,
  QuoteDownIcon,
  Share01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy, Download } from "lucide-react";
import { toBlob, toSvg } from "html-to-image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CITATION_APA, CITATION_BIBTEX } from "@/lib/citation";
import { cn } from "@/lib/utils";

type ExportState = "idle" | "copied" | "error";

export type ExportImageOptions = NonNullable<Parameters<typeof toBlob>[1]>;

/** An offscreen clone, styled for capture, plus how to render it. */
export type PreparedExportImage = {
  element: HTMLElement;
  options: ExportImageOptions;
  cleanup: () => void;
};

type ViewExportMenuProps = {
  /** Base file name for downloads (no extension). */
  fileBaseName: string;
  /** Tab-separated data: an optional title line, a blank line, then a table. */
  getTsv: () => string;
  /** Builds the capture-ready clone; resolves null when the view isn't ready. */
  prepareImage: () => Promise<PreparedExportImage | null>;
  accentColor: string;
};

/** Turn the shared TSV layout (title, blank, header, rows) into Markdown. */
export function tsvToMarkdown(tsv: string): string {
  const lines = tsv.split("\n");
  const blank = lines.indexOf("");
  const title = blank > 0 ? lines.slice(0, blank) : [];
  const table = (blank >= 0 ? lines.slice(blank + 1) : lines).filter(
    (line) => line.length > 0,
  );
  if (table.length === 0) return title.join("\n");

  const cells = table.map((line) =>
    line.split("\t").map((cell) => cell.replace(/\|/g, "\\|")),
  );
  const [header, ...rows] = cells;
  const toRow = (row: string[]) => `| ${row.join(" | ")} |`;
  const separator = `| ${header!.map(() => "---").join(" | ")} |`;

  return [
    ...title.map((line) => `**${line}**`),
    ...(title.length ? [""] : []),
    toRow(header!),
    separator,
    ...rows.map(toRow),
  ].join("\n");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function renderPrepared<T>(
  prepareImage: () => Promise<PreparedExportImage | null>,
  render: (prepared: PreparedExportImage) => Promise<T>,
): Promise<T> {
  // Let the menu close and paint before the heavy capture work.
  await new Promise(requestAnimationFrame);
  const prepared = await prepareImage();
  if (!prepared) throw new Error("View is not ready to export.");
  try {
    return await render(prepared);
  } finally {
    prepared.cleanup();
  }
}

export function ViewExportMenu({
  fileBaseName,
  getTsv,
  prepareImage,
  accentColor,
}: ViewExportMenuProps) {
  const [state, setState] = useState<ExportState>("idle");
  const [linkState, setLinkState] = useState<ExportState>("idle");

  /** The URL already carries view, domain, version, filters and columns. */
  async function copyViewLink() {
    try {
      const url = new URL(window.location.href);
      url.pathname = "/";
      url.hash = "";
      await navigator.clipboard.writeText(url.toString());
      setLinkState("copied");
    } catch {
      setLinkState("error");
    }
    window.setTimeout(() => setLinkState("idle"), 1600);
  }

  function flash(next: ExportState) {
    setState(next);
    window.setTimeout(() => setState("idle"), 1600);
  }

  async function run(action: () => Promise<void>, success: ExportState) {
    try {
      await action();
      if (success === "idle") setState("idle");
      else flash(success);
    } catch (error) {
      console.error("Export failed", error);
      flash("error");
    }
  }

  const copyText = (text: string) => navigator.clipboard.writeText(text);

  const renderPng = () =>
    renderPrepared(prepareImage, async ({ element, options }) => {
      const blob = await toBlob(element, options);
      if (!blob) throw new Error("Could not create PNG.");
      return blob;
    });

  const renderSvg = () =>
    renderPrepared(prepareImage, async ({ element, options }) => {
      const dataUrl = await toSvg(element, options);
      return fetch(dataUrl).then((response) => response.blob());
    });

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copy or download this view"
              className="active:!translate-y-0"
            />
          }
        >
          <HugeiconsIcon
            icon={state === "copied" ? Tick02Icon : Share01Icon}
            strokeWidth={2}
            className={cn(
              "text-muted-foreground",
              state === "error" && "text-destructive",
            )}
            style={state === "copied" ? { color: accentColor } : undefined}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="top"
          collisionAvoidance={{ side: "none", fallbackAxisSide: "none" }}
          className="min-w-48 whitespace-nowrap"
        >
          <DropdownMenuItem
            onClick={() =>
              run(() => copyText(tsvToMarkdown(getTsv())), "copied")
            }
          >
            <Copy className="size-4" strokeWidth={2} aria-hidden />
            Copy Markdown
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => run(() => copyText(getTsv()), "copied")}
          >
            <Copy className="size-4" strokeWidth={2} aria-hidden />
            Copy TSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              run(async () => {
                if (
                  !navigator.clipboard?.write ||
                  typeof ClipboardItem === "undefined"
                ) {
                  throw new Error("Clipboard images are not supported here.");
                }
                const blob = await renderPng();
                await navigator.clipboard.write([
                  new ClipboardItem({ "image/png": blob }),
                ]);
              }, "copied")
            }
          >
            <Copy className="size-4" strokeWidth={2} aria-hidden />
            Copy PNG
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              run(async () => {
                downloadBlob(
                  new Blob([getTsv()], { type: "text/tab-separated-values" }),
                  `${fileBaseName}.tsv`,
                );
              }, "idle")
            }
          >
            <Download className="size-4" strokeWidth={2} aria-hidden />
            Download TSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              run(async () => {
                downloadBlob(await renderPng(), `${fileBaseName}.png`);
              }, "idle")
            }
          >
            <Download className="size-4" strokeWidth={2} aria-hidden />
            Download PNG
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              run(async () => {
                downloadBlob(await renderSvg(), `${fileBaseName}.svg`);
              }, "idle")
            }
          >
            <Download className="size-4" strokeWidth={2} aria-hidden />
            Download SVG
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => run(() => copyText(CITATION_APA), "copied")}
          >
            <HugeiconsIcon icon={QuoteDownIcon} strokeWidth={2} />
            Cite (APA)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => run(() => copyText(CITATION_BIBTEX), "copied")}
          >
            <HugeiconsIcon icon={QuoteDownIcon} strokeWidth={2} />
            Cite (BibTeX)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copy link to this view"
              className="active:!translate-y-0"
              onClick={copyViewLink}
            />
          }
        >
          <HugeiconsIcon
            icon={linkState === "copied" ? Tick02Icon : Link02Icon}
            strokeWidth={2}
            className={cn(
              "text-muted-foreground",
              linkState === "error" && "text-destructive",
            )}
            style={linkState === "copied" ? { color: accentColor } : undefined}
          />
        </TooltipTrigger>
        <TooltipContent>
          {linkState === "copied"
            ? "Copied link"
            : linkState === "error"
              ? "Could not copy link"
              : "Copy link to this view"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
