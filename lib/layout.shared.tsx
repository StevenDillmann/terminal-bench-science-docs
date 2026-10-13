import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Mail } from 'lucide-react';
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
        text: 'CONTRIBUTE',
        url: '/contribute',
      },
      {
        text: 'COMMUNITY',
        url: 'https://discord.com/invite/2Pe5uWGcV3',
        external: true,
      },
      {
        text: 'CONTRIBUTORS',
        url: '/contributors',
      },
      {
        type: 'icon',
        label: 'Contact',
        text: 'Contact',
        icon: <Mail />,
        url: 'mailto:stevendi@stanford.edu',
        external: false,
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
