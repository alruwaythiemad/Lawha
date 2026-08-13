import { describe, expect, it } from 'vitest';
import { format } from '../src/catalogue';

describe('format', () => {
  it('resolves a plain catalogue entry per locale', () => {
    expect(format('en', 'common.appName')).toBe('Lawha');
    expect(format('ar', 'common.appName')).toBe('لوحة');
  });

  it('substitutes named placeholders', () => {
    expect(format('en', 'common.greeting', { name: 'Sam' })).toBe('Hello, Sam!');
    expect(format('ar', 'common.greeting', { name: 'سام' })).toBe('مرحبًا يا سام!');
  });

  it('throws when the resolved catalogue lacks the key', () => {
    // Exercises the runtime guard for a key composed from a non-literal —
    // the one path the MessageKey type system can't block (AD-22).
    // @ts-expect-error - deliberately passing a key outside the MessageKey union
    expect(() => format('en', 'does.not.exist')).toThrow(/Missing catalogue message/);
  });
});
