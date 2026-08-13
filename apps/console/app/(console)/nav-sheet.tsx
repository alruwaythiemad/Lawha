'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { format, type Locale } from '@lawha/i18n';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NavList } from './nav-list';

interface NavSheetProps {
  locale: Locale;
}

// Nav sheet, AC2/AC3 — the <1024px counterpart to NavRail (rendered
// alongside it; each is hidden/shown purely with Tailwind responsive
// classes at the same 1024px boundary so exactly one is ever visible). The
// shadcn/Radix Sheet (Task 1) supplies the focus trap, Escape-to-close, and
// focus-return-to-trigger for free — this component only wires it up and
// styles it with {components.nav-sheet} (full-bleed, opaque scrim, see
// components/ui/sheet.tsx).
export function NavSheet({ locale }: NavSheetProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // SheetContent is portaled to document.body (Radix Dialog.Portal), so the
  // "lg:hidden" wrapper below only ever hides the trigger — it does nothing
  // to an already-open sheet's portaled content. Close explicitly whenever
  // the viewport crosses into rail territory (>=1024px) or the route
  // changes by any means other than NavList's own onNavigate (e.g. browser
  // back/forward), so the sheet never survives past the state it was opened
  // for.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const closeIfDesktop = () => {
      if (query.matches) setOpen(false);
    };
    closeIfDesktop();
    query.addEventListener('change', closeIfDesktop);
    return () => query.removeEventListener('change', closeIfDesktop);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label={format(locale, 'shell.nav.menuTrigger')}
          className="ps-control-pad-inline pe-control-pad-inline flex items-center justify-center rounded text-foreground focus-visible:outline-2 focus-visible:outline-electric focus-visible:outline-offset-2"
          // eslint-disable-next-line lawha/no-literal-design-values -- verbatim {components.nav-item} minBlockSize (44px), see nav-list.tsx
          style={{ minBlockSize: '44px', minInlineSize: '44px' }}
        >
          <Menu aria-hidden="true" />
        </SheetTrigger>
        <SheetContent side="top" closeLabel={format(locale, 'shell.nav.close')}>
          <SheetTitle className="sr-only">{format(locale, 'shell.nav.menuTrigger')}</SheetTitle>
          <NavList locale={locale} pathname={pathname} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
