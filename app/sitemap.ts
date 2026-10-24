import type { MetadataRoute } from 'next';
import { highlightsSource, pagesSource } from '@/lib/source';

const host = 'https://www.terminal-bench-science.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const urls = new Set(['/', '/announcements', '/contributors', '/highlights']);
  for (const s of [pagesSource, highlightsSource]) {
    for (const page of s.getPages()) urls.add(page.url);
  }
  return [...urls].sort().map((url) => ({ url: `${host}${url === '/' ? '' : url}` }));
}
