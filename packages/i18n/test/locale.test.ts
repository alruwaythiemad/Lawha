import { describe, expect, it } from 'vitest';
import { directionForLocale } from '../src/locale';

describe('directionForLocale', () => {
  it('maps en to ltr and ar to rtl', () => {
    expect(directionForLocale('en')).toBe('ltr');
    expect(directionForLocale('ar')).toBe('rtl');
  });
});
