import { describe, expect, it } from 'vitest';
import { NAV_ITEMS } from './nav-items';

describe('NAV_ITEMS', () => {
  it('lists exactly the 7 nav-reachable surfaces, in IA order', () => {
    expect(NAV_ITEMS.map((item) => item.href)).toEqual([
      '/screens',
      '/media',
      '/playlists',
      '/schedules',
      '/branches',
      '/billing',
      '/settings',
    ]);
  });

  it('never includes "Pair a screen" or "Playlist editor" — both are flow-only, not nav destinations', () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(hrefs).not.toContain('/screens/pair');
    expect(hrefs).not.toContain('/playlists/editor');
    expect(NAV_ITEMS.some((item) => item.labelKey.toLowerCase().includes('pair'))).toBe(false);
    expect(NAV_ITEMS.some((item) => item.labelKey.toLowerCase().includes('editor'))).toBe(false);
  });

  it('each item has a distinct catalogue label key under the shell.nav namespace', () => {
    const labelKeys = NAV_ITEMS.map((item) => item.labelKey);
    expect(new Set(labelKeys).size).toBe(labelKeys.length);
    for (const key of labelKeys) {
      expect(key.startsWith('shell.nav.')).toBe(true);
    }
  });
});
