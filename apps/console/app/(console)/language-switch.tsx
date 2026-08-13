'use client';

import { useRef, useTransition } from 'react';
import { format, type Locale } from '@lawha/i18n';
import { setLocaleAction } from './actions';

interface LanguageSwitchProps {
  locale: Locale;
}

// {components.button-secondary} shape (Dev Notes → Task 4) — no component
// token exists for a language switch itself, so this is a story-level
// design decision bound only by the general system rules. Shows the
// language it switches *to*, in that language's own script (the same
// locale-invariant-label pattern /i18n-check already uses).
export function LanguageSwitch({ locale }: LanguageSwitchProps) {
  const [isPending, startTransition] = useTransition();
  // isPending only reflects committed React state, which lags a fast
  // double-activation (double-click, held Enter) by a render — this ref
  // closes that window so the Server Action can't fire twice and toggle
  // the value back to its original state.
  const firing = useRef(false);
  const nextLocale: Locale = locale === 'en' ? 'ar' : 'en';
  const label = format(locale, nextLocale === 'ar' ? 'shell.language.labelAr' : 'shell.language.labelEn');

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (firing.current) return;
        firing.current = true;
        startTransition(async () => {
          await setLocaleAction(nextLocale);
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
