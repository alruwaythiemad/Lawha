import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber } from '../src/formatters';

// Excludes both the Arabic-Indic (U+0660-0669) and Extended Arabic-Indic /
// Persian (U+06F0-06F9) digit blocks — 'ar' can resolve to either non-Latin
// numbering system depending on the engine/locale negotiation.
const LATIN_DIGIT_RE = /^[^٠-٩۰-۹]*$/;

describe('formatDate', () => {
  it('formats per locale using explicit fields, not dateStyle/timeStyle', () => {
    const date = new Date(Date.UTC(2026, 7, 12));
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };

    expect(formatDate('en', date, options)).toBe('August 12, 2026');
    expect(formatDate('ar', date, options)).toContain('2026');
  });

  it('keeps numerals Latin-digit in Arabic (FR50/FR54)', () => {
    const date = new Date(Date.UTC(2026, 7, 12));
    const result = formatDate('ar', date, { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' });
    expect(LATIN_DIGIT_RE.test(result)).toBe(true);
  });
});

describe('formatNumber', () => {
  it('formats per locale with Latin digits in both locales', () => {
    expect(formatNumber('en', 1234.5)).toBe('1,234.5');
    expect(LATIN_DIGIT_RE.test(formatNumber('ar', 1234.5))).toBe(true);
  });
});
