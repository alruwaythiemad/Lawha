import { colors, PLAYER_NEUTRAL_COLOR_NAMES, type ColorName } from './colors';
import { rounded } from './rounded';
import { spacing } from './spacing';

const PLAYER_NEUTRAL_NAME_SET = new Set<string>(PLAYER_NEUTRAL_COLOR_NAMES);

/**
 * Tailwind theme values as `var(--color-X)` references rather than raw hex.
 * This is what makes the `[data-theme="dark"]` substitution rule (Task 3)
 * actually reach Tailwind-generated utility classes: a component writing
 * `bg-background` compiles to `background-color: var(--color-background)`,
 * and only the CSS variable's value differs between themes — the utility
 * class itself never changes. `-dark`-suffixed names are excluded: no
 * component ever writes `bg-background-dark` directly, so no such utility
 * should exist to accidentally reach for. `player-neutral-*` names are also
 * excluded — they're player-only, non-themed tokens (see colors.ts) and
 * have no business being a reachable console Tailwind utility.
 */
export const tailwindColorTheme: Record<string, string> = Object.fromEntries(
  (Object.keys(colors) as ColorName[])
    .filter((name) => !name.endsWith('-dark') && !PLAYER_NEUTRAL_NAME_SET.has(name))
    .map((name) => [name, `var(--color-${name})`]),
);

export const tailwindRoundedTheme: Record<string, string> = Object.fromEntries(
  Object.keys(rounded).map((name) => [name, `var(--rounded-${name})`]),
);

export const tailwindSpacingTheme: Record<string, string> = Object.fromEntries(
  Object.keys(spacing).map((name) => [name, `var(--spacing-${name})`]),
);
