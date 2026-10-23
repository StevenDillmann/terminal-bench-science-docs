import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { GeistSans } from 'geist/font/sans';
import { Google_Sans_Code } from 'next/font/google';

import { AppProviders } from '@/components/providers/app-providers';
import { appName } from '@/lib/shared';
import { cn } from '@/lib/utils';
import './global.css';

const googleSansCode = Google_Sans_Code({
  subsets: ['latin'],
  variable: '--font-google-sans-code',
});

const siteUrl = 'https://terminal-bench-science.ai';
const siteDescription =
  'A benchmark for evaluating AI agents on research workflows across scientific domains';

export const metadata: Metadata = {
  title: appName,
  metadataBase: new URL(siteUrl),
  description: siteDescription,
  // SVG for browsers; PNG/ICO for crawlers that don't take SVG (Google's
  // favicon crawler had none on file for the site); a PNG apple-touch-icon,
  // since iOS ignores an SVG one. All rendered from favicon.svg.
  icons: {
    icon: [
      { url: '/favicon.svg?v=7', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: appName,
    description: siteDescription,
    images: [
      {
        url: '/terminal-bench-science-og-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'Terminal-Bench-Science',
      },
    ],
    url: siteUrl,
    siteName: appName,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description: siteDescription,
    images: [
      {
        url: '/terminal-bench-science-twitter-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'Terminal-Bench-Science',
      },
    ],
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={cn(
        googleSansCode.variable,
        GeistSans.variable,
        'font-sans',
      )}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen font-sans antialiased">
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
