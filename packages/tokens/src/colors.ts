// Verbatim transcription of DESIGN.md § colors. Do not approximate values.

/**
 * Every key here that has a `-dark` sibling is a themed token: under
 * `[data-theme="dark"]` it resolves to its `-dark` value. `alarm`, `amber`,
 * `on-signal` (and their `-foreground`/`-companion` pairs) deliberately have
 * no `-dark` sibling — they are theme-invariant by omission, not by a rule
 * layered on top. `player-neutral-*` also has no sibling, but is excluded
 * from theme resolution entirely (see THEME_INVARIANT_COLOR_NAMES / the
 * player-neutral guard in css-variables.ts) because the player has no theme
 * at all — a resolver that merely checks "no `-dark` sibling" would treat it
 * identically to the signal colours, which is correct today but not for the
 * right reason, and a future signal-colour addition without a `-dark`
 * sibling of its own would silently misclassify a player neutral as a
 * themed token if this file ever grew a naive existence check.
 */
export const colors = {
  background: '#FFFFFF',
  foreground: '#000000',
  'muted-foreground': '#666666',
  border: '#000000',
  divider: '#DADADA',
  input: '#000000',
  electric: '#0F2BFF',
  'electric-foreground': '#FFFFFF',
  alarm: '#FF2D00',
  'alarm-foreground': '#000000',
  amber: '#FFB800',
  'amber-foreground': '#000000',
  'on-signal': '#000000',
  'on-signal-companion': '#FFFFFF',
  'background-dark': '#0A0A0A',
  'foreground-dark': '#FFFFFF',
  'muted-foreground-dark': '#999999',
  'border-dark': '#FFFFFF',
  'divider-dark': '#2A2A2A',
  'input-dark': '#FFFFFF',
  'electric-dark': '#5C7CFF',
  'electric-foreground-dark': '#000000',
  'player-neutral-ground': '#0A0A0A',
  'player-neutral-mark': '#555555',
} as const;

export type ColorName = keyof typeof colors;

/** Signal colours: theme-invariant by product rule, not merely by data shape. */
export const THEME_INVARIANT_COLOR_NAMES = [
  'alarm',
  'alarm-foreground',
  'amber',
  'amber-foreground',
  'on-signal',
  'on-signal-companion',
] as const satisfies readonly ColorName[];

/** Not theme tokens at all — literal values for the customer-register holding card. */
export const PLAYER_NEUTRAL_COLOR_NAMES = [
  'player-neutral-ground',
  'player-neutral-mark',
] as const satisfies readonly ColorName[];
