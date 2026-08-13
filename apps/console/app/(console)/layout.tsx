import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { format } from '@lawha/i18n';
import { resolveLocale } from '../locale-cookie';
import { resolveTheme } from '../theme-cookie';
import { ensureWorkspaceForClerkUser } from '../../lib/workspace-bootstrap';
import { NavRail } from './nav-rail';
import { NavSheet } from './nav-sheet';
import { LanguageSwitch } from './language-switch';
import { ThemeSwitch } from './theme-switch';
import { StatusAnnouncer } from './status-announcer';

// Normal nested layout under app/layout.tsx (Story 1.2's root layout already
// declares <html>/<body>, so Next.js's "full page reload between root
// layouts" caveat does not apply here — see Dev Notes).
//
// This is the console's first auth gate (Story 1.5) — the shell rendered
// unconditionally before this. auth.protect() runs here rather than in
// proxy.ts: current Clerk guidance treats middleware-based protection as
// deprecated in favor of "as close to the resource as possible" checks,
// and doing it here also sidesteps the known upstream issue
// (clerk/javascript#8302) where auth.protect() inside proxy.ts can
// redirect to the current URL instead of the sign-in page. Per Clerk's own
// docs, a layout check alone is not a complete defense against
// client-side navigation — this is the shell's entry gate, not a
// substitute for protecting individual server actions/routes as those are
// added in later stories.
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth.protect();
  const workspace = await ensureWorkspaceForClerkUser(userId);

  // Story 1.7 AC1: pass the signed-in owner's persisted preference in —
  // resolveLocale() prefers it over any Accept-Language guess whenever the
  // locale cookie is absent (a new device, cleared cookies).
  const [locale, theme] = await Promise.all([resolveLocale(workspace.language), resolveTheme()]);

  return (
    <>
      {/* AC5: must be the first focusable element in the document — nothing
          (not even the language/theme switch) may precede it. AC4: sr-only
          collapses it to 1px when unfocused (correct — invisible content
          must not occupy layout space), so the 44px minimum only needs to
          hold once focus:not-sr-only takes over; type-label's 10px line
          height plus control-pad-block's 12px/12px padding alone falls
          short of that (34px), hence the explicit focus-only floor below. */}
      <a
        href="#main-content"
        // eslint-disable-next-line lawha/no-literal-design-values -- focus-only 44px target-size floor (AC4); no packages/tokens value exists for this, see nav-list.tsx's same-shaped precedent
        className="type-label sr-only rounded bg-background text-foreground focus:not-sr-only focus:fixed focus:start-gutter focus:top-gutter focus:z-50 focus:box-border focus:flex focus:min-h-[44px] focus:items-center focus:px-control-pad-inline focus:py-control-pad-block focus-visible:outline-2 focus-visible:outline-electric focus-visible:outline-offset-2"
      >
        {format(locale, 'shell.skipToContent')}
      </a>

      {/* Implicit `banner` landmark — must stay outside <main>/any sectioning
          element or it silently loses the role (Dev Notes → Task 3). */}
      <header className="ps-page-margin pe-page-margin pt-page-margin pb-page-margin flex items-center justify-between border-b border-border">
        <span className="type-label text-foreground">{format(locale, 'common.appName')}</span>
        <div className="flex items-center gap-gutter">
          <LanguageSwitch locale={locale} />
          <ThemeSwitch locale={locale} theme={theme} />
          {/* Clerk's own UI, deliberately unmirrored/English-only (FR53
              exception, same as the sign-in/sign-up pages) — the only
              sign-out affordance in the shell (Task 7 needs this to verify
              AC2 and cross-account RLS with more than one Clerk account). */}
          <UserButton />
        </div>
      </header>

      {/* One global status announcer (AC3) — mounted once, sibling of
          header/the nav+main wrapper, before <main> in source order. */}
      <StatusAnnouncer />

      <div className="flex">
        {/* Implicit `navigation` landmark, hosting both the persistent rail
            (>=1024px) and the sheet trigger + content (<1024px) — exactly
            one is ever visible at a given viewport (Dev Notes → Task 3). */}
        <nav className="shrink-0">
          <NavRail locale={locale} />
          <NavSheet locale={locale} />
        </nav>

        {/* Implicit `main` landmark — the skip link's target. */}
        {/* tabIndex={-1}: the skip link's href="#main-content" alone would
            scroll the viewport here without moving DOM focus, since <main>
            isn't natively focusable — leaving the next Tab press to resume
            from wherever focus was before activation. This makes it a valid
            programmatic focus target without adding it to the Tab order. */}
        <main
          id="main-content"
          tabIndex={-1}
          className="ps-page-margin pe-page-margin pt-page-margin pb-page-margin min-w-0 flex-1"
        >
          {children}
        </main>
      </div>
    </>
  );
}
