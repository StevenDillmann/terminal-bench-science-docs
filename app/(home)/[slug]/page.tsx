import { getMDXComponents } from "@/components/mdx";
import { pagesSource } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RunSubtitle, RunSubtitleFallback } from "@/components/run-subtitle";

import { cn } from "@/lib/utils";

const pageDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatPageDate(date: string) {
  return pageDateFormatter.format(new Date(date));
}

export default async function Page(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const page = pagesSource.getPage([slug]);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <article
      className={cn(
        "content-page mx-auto w-full max-w-3xl flex-1 px-4 py-12",
        GeistSans.className,
      )}
    >
      <DocsTitle className="!text-2xl sm:!text-3xl md:!text-[3.125rem]">
        {page.data.title}
      </DocsTitle>
      {slug === "run" ? (
        <Suspense fallback={<RunSubtitleFallback />}>
          <RunSubtitle />
        </Suspense>
      ) : page.data.description ? (
        <DocsDescription className="page-subtitle mt-2">
          {page.data.description}
        </DocsDescription>
      ) : null}
      {page.data.author || page.data.date ? (
        <p className="mb-8 text-sm text-muted-foreground">
          {page.data.author ? (
            <span>
              Written by{" "}
              {page.data.authorUrl ? (
                <a
                  href={page.data.authorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-current"
                >
                  {page.data.author}
                </a>
              ) : (
                <span className="text-foreground">{page.data.author}</span>
              )}
            </span>
          ) : null}
          {page.data.author && page.data.date ? " on " : null}
          {page.data.date ? (
            <time dateTime={page.data.date}>
              {formatPageDate(page.data.date)}
            </time>
          ) : null}
        </p>
      ) : null}
      <DocsBody
        className={cn(
          (slug === "announcement" || slug === "contribute") &&
            "[&_p]:text-justify",
        )}
      >
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </article>
  );
}

export function generateStaticParams() {
  return pagesSource.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}

export async function generateMetadata(
  props: PageProps<"/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const page = pagesSource.getPage([slug]);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
