import Image from 'next/image';

import { cn } from '@/lib/utils';

export function SiteLogo({ className }: { className?: string }) {
  const imageClass = cn('w-auto', className ?? 'h-8');
  return (
    <span className={cn('flex items-center', className ?? 'h-8')}>
      <Image
        src="/tb-science-logo-light-bold.png"
        alt="Terminal-Bench-Science"
        width={2449}
        height={468}
        className={cn(imageClass, 'dark:hidden')}
      />
      <Image
        src="/tb-science-logo-dark-bold.png"
        alt="Terminal-Bench-Science"
        width={2449}
        height={468}
        className={cn(imageClass, 'hidden dark:block')}
      />
    </span>
  );
}
