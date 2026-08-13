import { describe, expect, it } from 'vitest';
import { colors } from '../src/colors';
import { spacing } from '../src/spacing';
import { rounded } from '../src/rounded';
import { resolveTokenRef } from '../src/resolve';

describe('resolveTokenRef', () => {
  it('resolves a single bare reference', () => {
    expect(resolveTokenRef('colors.electric')).toBe(colors.electric);
    expect(resolveTokenRef('rounded.DEFAULT')).toBe(rounded.DEFAULT);
  });

  it('resolves multiple references joined as a CSS shorthand', () => {
    expect(resolveTokenRef('spacing.control-pad-block spacing.control-pad-inline')).toBe(
      `${spacing['control-pad-block']} ${spacing['control-pad-inline']}`,
    );
  });

  it('resolves a literal prefixed onto a reference', () => {
    expect(resolveTokenRef('8px spacing.row-pad-inline')).toBe(`8px ${spacing['row-pad-inline']}`);
  });

  it('resolves a literal/keyword shorthand wrapped around a reference', () => {
    expect(resolveTokenRef('2px solid colors.electric')).toBe(`2px solid ${colors.electric}`);
  });

  it('throws on a string with no table.name pattern at all', () => {
    expect(() => resolveTokenRef('outer 10% of one corner')).toThrow('Unresolvable token reference');
  });

  it('throws on an unknown table', () => {
    expect(() => resolveTokenRef('components.focus-ring-on-signal')).toThrow('Unresolvable token reference');
  });

  it('throws on a known table with an unknown name', () => {
    expect(() => resolveTokenRef('colors.does-not-exist')).toThrow('Unresolvable token reference');
  });
});
