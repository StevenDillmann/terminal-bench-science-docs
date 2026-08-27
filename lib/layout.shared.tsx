import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SiteLogo } from '@/components/site-logo';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <SiteLogo />,
      url: '/',
    },
    links: [
      {
        text: 'LEADERBOARD',
        url: '/',
      },
      {
        text: 'ANNOUNCEMENT',
        url: '/announcement',
      },
      {
        text: 'RUN',
        url: '/run',
      },
      {
        text: 'CONTRIBUTORS',
        url: '/contributors',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    searchToggle: {
      enabled: false,
    },
    themeSwitch: {
      mode: 'light-dark-system',
    },
  };
}
