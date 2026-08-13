import IntlMessageFormat from 'intl-messageformat';
import en from './catalogues/en.json';
import ar from './catalogues/ar.json';
import type { Locale } from './locale';

// en.json is the source of truth: MessageKey is derived from its keys, so
// referencing a nonexistent key is a TypeScript error at `pnpm run
// typecheck` (AC3's compile-time half — see the Vitest parity test in
// catalogue.test.ts for the runtime/CI half).
export type MessageKey = keyof typeof en;

const catalogues: Record<Locale, Record<string, string>> = { en, ar };

export type MessageValues = Record<string, string | number>;

/**
 * Formats a catalogue entry for the given locale. Throws if the resolved
 * catalogue lacks `key` — defends AC3 at runtime for any path the type
 * system can't reach (e.g. a key composed from a non-literal, which AD-22
 * forbids anyway).
 */
export function format(locale: Locale, key: MessageKey, values?: MessageValues): string {
  const catalogue = catalogues[locale];
  const message = catalogue[key];
  if (message === undefined) {
    throw new Error(`Missing catalogue message "${key}" for locale "${locale}"`);
  }
  const result = new IntlMessageFormat(message, locale).format(values);
  if (typeof result !== 'string') {
    // IntlMessageFormat.format() only returns a non-string array for ICU
    // rich-text/tag syntax, which no catalogue entry in this project uses
    // (plain string interpolation only, per AD-22). Fail loudly rather than
    // let a future tag-syntax entry type-check and misbehave at render time.
    throw new Error(`Catalogue message "${key}" for locale "${locale}" did not resolve to a string`);
  }
  return result;
}
