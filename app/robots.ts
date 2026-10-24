import type { MetadataRoute } from 'next';

const host = 'https://www.terminal-bench-science.ai';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
