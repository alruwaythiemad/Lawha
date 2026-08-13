import { describe, expect, it } from 'vitest';
import { buildColorVariables, generateTokenCss } from '../src/css-variables';

describe('buildColorVariables', () => {
  it('partitions the real colors.ts without throwing', () => {
    expect(() => buildColorVariables()).not.toThrow();
  });

  it('every base colour with a -dark sibling appears in both root and dark', () => {
    const { root, dark } = buildColorVariables();
    for (const key of Object.keys(dark)) {
      expect(root).toHaveProperty(key);
    }
  });
});

describe('generateTokenCss', () => {
  it('includes a [data-theme="dark"] block by default', () => {
    expect(generateTokenCss()).toContain('[data-theme="dark"]');
  });

  it('omits the dark block when includeDarkTheme is false — the player has no theme', () => {
    const css = generateTokenCss({ includeDarkTheme: false });
    expect(css).not.toContain('[data-theme="dark"]');
    expect(css).toContain(':root');
  });
});
