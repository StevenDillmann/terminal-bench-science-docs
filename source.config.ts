import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

// You can customize Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

/** Standalone MDX pages (nav links) — rendered without the docs sidebar layout. */
export const pages = defineDocs({
  dir: 'content/pages',
  docs: {
    // `author` and `date` (YYYY-MM-DD) render an article byline under the title.
    schema: pageSchema.extend({
      author: z.string().optional(),
      authorUrl: z.string().url().optional(),
      date: z.string().date().optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
});

/** Research highlights: one MDX file per featured task; the body is the author's insight. */
export const highlights = defineDocs({
  dir: 'content/highlights',
  docs: {
    schema: pageSchema.extend({
      /** Repo path under tasks/, e.g. "life-sciences/biology/genomic-model-ranking". */
      taskPath: z.string(),
      domain: z.enum(['life', 'physical', 'earth', 'mathematical', 'engineering']),
      author: z.string(),
      affiliation: z.string().optional(),
      /** Path under /public, e.g. "/highlights/genomic-model-ranking.png". */
      image: z.string(),
      imageAlt: z.string(),
      date: z.string().date(),
      /** Placeholder content awaiting the author's own text. */
      example: z.boolean().optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
