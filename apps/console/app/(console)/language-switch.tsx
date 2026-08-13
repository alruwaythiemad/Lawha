'use client';

import { useRef, useTransition } from 'react';
import { format, type Locale } from '@lawha/i18n';
import { setLocaleAction } from './actions';
import { useStatusAnnouncer } from './status-announcer-store';

interface LanguageSwitchProps {
  locale: Locale;
}

// {components.button-secondary} shape (Dev Notes → Task 4) — no component
// token exists for a language switch itself, so this is a story-level
// design decision bound only by the general system rules. Shows the
// language it switches *to*, in that language's own script.
export function LanguageSwitch({ locale }: LanguageSwitchProps) {
  const [isPending, startTransition] = useTransition();
  // isPending only reflects committed React state, which lags a fast
  // double-activation (double-click, held Enter) by a render — this ref
  // closes that window so the Server Action can't fire twice and toggle
  // the value back to its original state.
  const firing = useRef(false);
  const { announceAlert } = useStatusAnnouncer();
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
          try {
            const { persisted } = await setLocaleAction(nextLocale);
            if (!persisted) {
              // EXPERIENCE.md → Settings "save failure rolls back": the
              // workspace write failed, so revert the cookie (and the
              // server-rendered tree it drives) back to the locale this
              // owner's workspace still actually has on file. Re-uses this
              // same action rather than a cookie-only path — its own
              // best-effort re-persist of `locale` is a no-op if the
              // workspace already holds it, and self-heals if the earlier
              // failure was transient.
              await setLocaleAction(locale);
              announceAlert(format(locale, 'shell.language.saveFailed'));
            }
          } catch {
            // Review fix: setLocaleAction's own cookie write (unguarded,
            // ahead of its try/catch) can itself throw — without this catch
            // the rejection would skip `firing.current = false` below and
            // permanently disable the button.
            announceAlert(format(locale, 'shell.language.saveFailed'));
          } finally {
            firing.current = false;
          }
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
