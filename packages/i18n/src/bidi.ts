/**
 * Bidi isolation for mixed Arabic/Latin runs (a price, a phone number, a
 * brand name) — realised as markup, never Unicode control characters
 * (U+2066/U+2069), which corrupt live-region and braille output (FR50).
 *
 * This package stays framework-agnostic (no React/Preact — see Dev Notes
 * → Scope boundaries), so it returns the tag/attribute spec rather than a
 * component. Each consuming app wraps this in a one-line component using
 * its own element/JSX runtime.
 */
export type BidiMode = 'auto' | 'ltr';

export interface BidiIsolationSpec {
  tag: 'bdi' | 'span';
  dir?: 'ltr';
}

export function bidiIsolationSpec(mode: BidiMode = 'auto'): BidiIsolationSpec {
  return mode === 'ltr' ? { tag: 'span', dir: 'ltr' } : { tag: 'bdi' };
}
