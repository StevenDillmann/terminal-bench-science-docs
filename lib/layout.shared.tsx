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
        text: 'RUN',
        url: '/run',
      },
      {
        text: 'CONTRIBUTE',
        url: '/contribution-call',
      },
      {
        text: 'ANNOUNCEMENTS',
        url: '/announcements',
      },
      {
        text: 'CONTRIBUTORS',
        url: '/contributors',
      },
      {
        text: 'COMMUNITY',
        url: 'https://discord.com/invite/2Pe5uWGcV3',
        external: true,
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
