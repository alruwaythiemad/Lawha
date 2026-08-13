import { cookies } from 'next/headers';
import type { Locale } from '@lawha/i18n';

export const LOCALE_COOKIE_NAME = 'lawha-locale';

// AD-21's root derivation (Task 2 of Story 1.3). The cookie is written by
// /i18n-check's temporary set-locale route handler and, as of Story 1.3,
// by setLocale below (called from app/(console)/actions.ts's Server
// Action). Story 1.7 owns real per-user, cross-device persistence — this
// cookie is only the browser-level half.
export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return cookieStore.get(LOCALE_COOKIE_NAME)?.value === 'ar' ? 'ar' : 'en';
}

// Write side (Story 1.3). Setting the cookie from a Server Action and
// letting the calling Client Component await it naturally refreshes the
// server-rendered tree (this file's resolveLocale re-runs) with no full
// page reload — that refresh is AC4, not something this function does
// itself.
export async function setLocale(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, { path: '/', maxAge: 60 * 60 * 24 * 400, sameSite: 'lax' });
}
