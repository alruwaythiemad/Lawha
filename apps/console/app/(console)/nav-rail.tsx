'use client';

import { usePathname } from 'next/navigation';
import type { Locale } from '@lawha/i18n';
import { NavList } from './nav-list';

interface NavRailProps {
  locale: Locale;
}

// Persistent rail, AC1 — granted only at >=1024px (Tailwind's `lg:`
// breakpoint happens to sit exactly at that threshold, so no custom
// breakpoint is needed). {spacing.nav-rail} (192px) is the rail's fixed
// width; AC1's "width set by the longer of the two languages' labels" is
// the design rationale already baked into that value, not something to
// compute at runtime (Dev Notes → Task 2).
export function NavRail({ locale }: NavRailProps) {
  const pathname = usePathname();

  return (
    <div className="hidden w-nav-rail shrink-0 border-e border-border lg:block">
      <NavList locale={locale} pathname={pathname} />
    </div>
  );
}
