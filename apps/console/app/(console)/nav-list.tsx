'use client';

import Link from 'next/link';
import { format, type Locale } from '@lawha/i18n';
import { NAV_ITEMS } from './nav-items';

interface NavListProps {
  locale: Locale;
  pathname: string;
  onNavigate?: () => void;
}

// {components.nav-item} / {components.nav-item-active} (packages/tokens,
// Story 1.1). Both the persistent rail and the nav sheet render this same
// list — see nav-rail.tsx / nav-sheet.tsx.
export function NavList({ locale, pathname, onNavigate }: NavListProps) {
  return (
    <ul className="flex flex-col">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? // {components.nav-item-active}: inversion + weight 800.
                    'type-body-sm ps-control-pad-inline pe-control-pad-inline flex items-center rounded bg-foreground font-extrabold text-background focus-visible:outline-2 focus-visible:outline-electric focus-visible:outline-offset-2'
                  : // {components.nav-item}: transparent, foreground text.
                    'type-body-sm ps-control-pad-inline pe-control-pad-inline flex items-center rounded text-foreground focus-visible:outline-2 focus-visible:outline-electric focus-visible:outline-offset-2'
              }
              // {components.nav-item}'s padding-block (8px) and minBlockSize
              // (44px) are literal in DESIGN.md/components.ts itself, not
              // named spacing-scale tokens — no packages/tokens value exists
              // to reference instead (see Dev Notes → Styling convention).
              // lawha/no-literal-design-values has no allowlist for a
              // literal sourced this way, only for packages/tokens itself.
              // eslint-disable-next-line lawha/no-literal-design-values -- verbatim {components.nav-item} minBlockSize/padding-block
              style={{ paddingBlock: '8px', minBlockSize: '44px' }}
            >
              {format(locale, item.labelKey)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
