import {
  Calendar03Icon,
  DiscordIcon,
  GithubIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/harbor-framework/terminal-bench-science",
    icon: GithubIcon,
  },
  {
    label: "Discord",
    href: "https://discord.com/invite/2Pe5uWGcV3",
    icon: DiscordIcon,
  },
  {
    label: "Calendar",
    href: "https://calendar.google.com/calendar/embed?src=2ca3e7fdc9e51a42ce18142e897f7db23fbf8e65867da1a06dc3ea5e6ad4e893%40group.calendar.google.com&ctz=America%2FLos_Angeles&mode=WEEK",
    icon: Calendar03Icon,
  },
  {
    label: "Contact",
    href: "mailto:stevendi@stanford.edu",
    icon: Mail01Icon,
  },
] as const;

/**
 * Quick links as the site's square outline icon buttons (as in the
 * leaderboard toolbar): GitHub, Discord, Calendar, Contact.
 */
export function CallLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {LINKS.map((link) => {
        const external = !link.href.startsWith("mailto:");
        return (
          <a
            key={link.label}
            href={link.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            aria-label={link.label}
            title={link.label}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "text-muted-foreground hover:text-foreground",
            )}
          >
            <HugeiconsIcon icon={link.icon} strokeWidth={2} />
          </a>
        );
      })}
    </div>
  );
}
