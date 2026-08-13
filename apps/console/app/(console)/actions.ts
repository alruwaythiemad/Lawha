'use server';

import type { Locale } from '@lawha/i18n';
import { setLocale } from '../locale-cookie';
import { setTheme, type Theme } from '../theme-cookie';

// The Server Action boundary Client Components call (language-switch.tsx,
// theme-switch.tsx) — invoking one of these from a Client Component
// refreshes the server-rendered tree with no full page reload (AC4).
export async function setLocaleAction(locale: Locale): Promise<void> {
  await setLocale(locale);
}

export async function setThemeAction(theme: Theme): Promise<void> {
  await setTheme(theme);
}
