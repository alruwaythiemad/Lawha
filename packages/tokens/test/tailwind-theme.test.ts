import { describe, expect, it } from 'vitest';
import { PLAYER_NEUTRAL_COLOR_NAMES } from '../src/colors';
import { tailwindColorTheme } from '../src/tailwind-theme';

describe('tailwindColorTheme', () => {
  it('excludes -dark suffixed names', () => {
    for (const name of Object.keys(tailwindColorTheme)) {
      expect(name.endsWith('-dark')).toBe(false);
    }
  });

  it('excludes player-neutral names — they are not a console concept', () => {
    for (const name of PLAYER_NEUTRAL_COLOR_NAMES) {
      expect(name in tailwindColorTheme).toBe(false);
    }
  });
});
