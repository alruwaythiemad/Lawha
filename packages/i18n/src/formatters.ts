import type { Locale } from './locale';

// Numerals stay Latin-digit in both locales (FR50/FR54) — 'ar' would
// otherwise resolve to Arabic-Indic digits by default in most engines.
const NUMBERING_SYSTEM = 'latn';

/**
 * Explicit format options only — no `dateStyle`/`timeStyle` shorthand.
 * Those convenience options landed exactly at the player's Chromium-76
 * floor with no margin below it (see Dev Notes → Latest technical
 * findings), so shared-with-player code stays on the explicit field form.
 */
export function formatDate(locale: Locale, date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, { ...options, numberingSystem: NUMBERING_SYSTEM }).format(date);
}

export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, { ...options, numberingSystem: NUMBERING_SYSTEM }).format(value);
}
