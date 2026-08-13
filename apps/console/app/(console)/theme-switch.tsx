'use client';

import { useRef, useTransition } from 'react';
import { format, type Locale } from '@lawha/i18n';
import type { Theme } from '../theme-cookie';
import { setThemeAction } from './actions';

interface ThemeSwitchProps {
  locale: Locale;
  theme: Theme;
}

// {components.button-secondary} shape (Dev Notes → Task 4), same pattern as
// LanguageSwitch. Shows the *current* theme (matching the precedent set by
// the now-retired app/token-check/theme-toggle.tsx), and toggles it.
export function ThemeSwitch({ locale, theme }: ThemeSwitchProps) {
  const [isPending, startTransition] = useTransition();
  // isPending only reflects committed React state, which lags a fast
  // double-activation (double-click, held Enter) by a render — this ref
  // closes that window so the Server Action can't fire twice and toggle
  // the value back to its original state.
  const firing = useRef(false);
  const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
  const label = format(locale, theme === 'light' ? 'shell.theme.light' : 'shell.theme.dark');

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (firing.current) return;
        firing.current = true;
        startTransition(async () => {
          await setThemeAction(nextTheme);
          firing.current = false;
        });
      }}
      className="type-label ps-control-pad-inline pe-control-pad-inline pt-control-pad-block pb-control-pad-block rounded border border-border bg-transparent text-foreground focus-visible:outline-2 focus-visible:outline-electric focus-visible:outline-offset-2 disabled:opacity-50"
      // eslint-disable-next-line lawha/no-literal-design-values -- verbatim {components.button-secondary} minBlockSize (44px), see nav-list.tsx
      style={{ minBlockSize: '44px' }}
    >
      {label}
    </button>
  );
}
