import { describe, expect, it } from 'vitest';
import { parse, isStructurallySame } from '@formatjs/icu-messageformat-parser';
import en from '../src/catalogues/en.json';
import ar from '../src/catalogues/ar.json';

describe('catalogue parity (AC3)', () => {
  it('en.json and ar.json declare exactly the same set of keys', () => {
    const enKeys = new Set(Object.keys(en));
    const arKeys = new Set(Object.keys(ar));

    const missingFromAr = [...enKeys].filter((key) => !arKeys.has(key));
    const missingFromEn = [...arKeys].filter((key) => !enKeys.has(key));

    expect(missingFromAr, 'keys present in en.json but missing from ar.json').toEqual([]);
    expect(missingFromEn, 'keys present in ar.json but missing from en.json').toEqual([]);
  });

  it('every catalogue entry is syntactically valid ICU MessageFormat', () => {
    for (const [locale, catalogue] of Object.entries({ en, ar })) {
      for (const [key, message] of Object.entries(catalogue)) {
        expect(() => parse(message), `${locale}.json → "${key}"`).not.toThrow();
      }
    }
  });

  it('en.json and ar.json use structurally identical placeholders per key', () => {
    // A translator renaming {name} to {otherName} (or changing its argument
    // type) in only one locale keeps the key sets equal and each message
    // independently valid ICU, so neither check above would catch it — the
    // mismatch only surfaces as a runtime "variable not provided" throw in
    // format(), for that locale only. isStructurallySame (the same parser
    // package's own equality primitive) closes that gap at CI time by
    // comparing each pair's set of variables and argument types.
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      const result = isStructurallySame(parse(en[key]), parse(ar[key]));
      expect(result.success, `"${key}": ar.json placeholders must structurally match en.json (${result.error?.message ?? ''})`).toBe(true);
    }
  });
});
