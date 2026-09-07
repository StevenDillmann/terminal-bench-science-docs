import { Root01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Atom,
  Earth,
  Galaxy,
  Leaf,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';

import type { DomainId } from '@/lib/domain-context';

export type DomainIconProps = {
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
};

export type DomainIconComponent = ComponentType<DomainIconProps>;

const lucide = (icon: LucideIcon): DomainIconComponent => icon;

/** Wrap a Hugeicons glyph so it takes the same props as a Lucide icon. */
function hugeicon(icon: typeof Root01Icon): DomainIconComponent {
  return function DomainHugeicon({ strokeWidth = 2, ...props }: DomainIconProps) {
    return <HugeiconsIcon icon={icon} strokeWidth={strokeWidth} {...props} />;
  };
}

/** One glyph per science; "all" is the atom from the logo. */
export const DOMAIN_ICONS: Record<DomainId, DomainIconComponent> = {
  all: lucide(Atom),
  life: lucide(Leaf),
  physical: lucide(Galaxy),
  earth: lucide(Earth),
  mathematical: hugeicon(Root01Icon),
  engineering: lucide(Rocket),
};
