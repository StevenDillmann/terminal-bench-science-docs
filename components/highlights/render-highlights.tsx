import { getMDXComponents } from "@/components/mdx";
import { HighlightCard } from "@/components/highlights/highlight-card";
import type { HighlightItem } from "@/components/highlights/highlights-grid";
import { highlightsSource } from "@/lib/source";

/** Server helper: every highlight rendered to a card, newest first. */
export function renderHighlightItems(): HighlightItem[] {
  return highlightsSource
    .getPages()
    .sort((a, b) => b.data.date.localeCompare(a.data.date))
    .map((page) => {
      const Body = page.data.body;
      return {
        id: page.url,
        domain: page.data.domain,
        example: page.data.example ?? false,
        node: (
          <HighlightCard
            title={page.data.title}
            taskPath={page.data.taskPath}
            domain={page.data.domain}
            author={page.data.author}
            affiliation={page.data.affiliation}
            image={page.data.image}
            imageAlt={page.data.imageAlt}
            date={page.data.date}
            example={page.data.example}
          >
            <Body components={getMDXComponents()} />
          </HighlightCard>
        ),
      };
    });
}
