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
  icons: {
    icon: [{ url: '/favicon.svg?v=6', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg?v=6',
    apple: '/favicon.svg?v=6',
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
