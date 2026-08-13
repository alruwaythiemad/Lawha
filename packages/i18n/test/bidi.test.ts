import { describe, expect, it } from 'vitest';
import { bidiIsolationSpec } from '../src/bidi';

describe('bidiIsolationSpec', () => {
  it('defaults to <bdi> auto-isolation', () => {
    expect(bidiIsolationSpec()).toEqual({ tag: 'bdi' });
    expect(bidiIsolationSpec('auto')).toEqual({ tag: 'bdi' });
  });

  it('uses an explicit dir="ltr" span when LTR semantics are required', () => {
    expect(bidiIsolationSpec('ltr')).toEqual({ tag: 'span', dir: 'ltr' });
  });
});
