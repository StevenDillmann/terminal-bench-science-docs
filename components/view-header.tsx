import type { ReactNode } from 'react';

import { SiteLogo } from '@/components/site-logo';
import { cn } from '@/lib/utils';

export function ViewHeader({
  title,
  subtitle,
  detail,
  children,
  icon,
  exportIcon = false,
  showLogo = false,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  detail?: ReactNode;
  children?: ReactNode;
  /** Top-right icon (e.g. the selected domain's glyph). */
  icon?: ReactNode;
  /** Keep the icon in image exports instead of swapping in the site logo. */
  exportIcon?: boolean;
  showLogo?: boolean;
}) {
  return (
    <header className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm uppercase text-muted-foreground">{title}</p>
        {subtitle != null ? (
          <p
            data-export-subtitle
            className="mt-0.5 hidden text-[10px] tracking-[0.08em] text-muted-foreground uppercase"
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <div
          data-export-meta
          className="items-center gap-3"
          style={{ display: 'flex' }}
        >
          {children ??
            (detail != null ? (
              <p className="text-xs tabular-nums text-muted-foreground">
                {detail}
              </p>
            ) : null)}
        </div>
        {icon != null ? (
          <span
            data-export-icon-slot
            data-export-icon={exportIcon ? '' : undefined}
            className="flex shrink-0 items-center"
          >
            {icon}
          </span>
        ) : null}
        <span
          data-export-logo
          className={cn(
            'shrink-0 items-center',
            showLogo ? 'flex' : 'hidden',
          )}
        >
          <SiteLogo />
        </span>
      </div>
    </header>
  );
}
