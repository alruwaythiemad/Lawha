import { colors, THEME_INVARIANT_COLOR_NAMES, PLAYER_NEUTRAL_COLOR_NAMES, type ColorName } from './colors';
import { rounded } from './rounded';
import { spacing } from './spacing';

export interface CssVariableSheet {
  /** `:root` — light values, plus the theme-invariant and player-neutral tokens. */
  root: Record<string, string>;
  /** `[data-theme="dark"]` overrides — only the themed subset. */
  dark: Record<string, string>;
}

const colorVarName = (name: string) => `--color-${name}`;

/**
 * Splits colors.ts into the three categories the theme substitution rule
 * requires: themed (has a `-dark` sibling), signal-invariant (named
 * explicitly — never assume invariance from data shape alone), and
 * player-neutral (excluded from theme resolution outright, never reachable
 * by an `X -> X-dark` lookup even a correct one).
 */
export function buildColorVariables(): CssVariableSheet {
  const root: Record<string, string> = {};
  const dark: Record<string, string> = {};

  const invariant = new Set<string>(THEME_INVARIANT_COLOR_NAMES);
  const playerNeutral = new Set<string>(PLAYER_NEUTRAL_COLOR_NAMES);
  const consumedDarkNames = new Set<string>();

  for (const name of Object.keys(colors) as ColorName[]) {
    if (name.endsWith('-dark') || playerNeutral.has(name)) continue;

    if (invariant.has(name)) {
      root[colorVarName(name)] = colors[name];
      continue;
    }

    const darkName = `${name}-dark` as ColorName;
    if (darkName in colors) {
      root[colorVarName(name)] = colors[name];
      dark[colorVarName(name)] = colors[darkName];
      consumedDarkNames.add(darkName);
    } else {
      // A colour with neither a -dark sibling nor an explicit invariant
      // listing is a data error, not a silent pass-through.
      throw new Error(`Color token "${name}" is neither themed nor declared theme-invariant.`);
    }
  }

  // Symmetric check: a -dark key with no base counterpart would otherwise
  // never be visited above (the loop skips -dark names outright) and would
  // silently vanish from both root and dark instead of erroring.
  for (const name of Object.keys(colors) as ColorName[]) {
    if (name.endsWith('-dark') && !consumedDarkNames.has(name)) {
      throw new Error(`Color token "${name}" is a -dark variant with no base counterpart.`);
    }
  }

  for (const name of playerNeutral) {
    root[colorVarName(name)] = colors[name as ColorName];
  }

  return { root, dark };
}

export function buildRoundedVariables(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(rounded)) {
    out[`--rounded-${name}`] = value;
  }
  return out;
}

export function buildSpacingVariables(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(spacing)) {
    out[`--spacing-${name}`] = value;
  }
  return out;
}

function toCssBlock(selector: string, vars: Record<string, string>): string {
  const lines = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`);
  return `${selector} {\n${lines.join('\n')}\n}`;
}

/**
 * Emits plain CSS custom properties only — no clamp()/min()/max(), no
 * nesting, no @layer — so the output is safe to load unmodified in the
 * player at the Chromium 76 floor as well as the console.
 *
 * `includeDarkTheme` defaults to true for the console, which does have a
 * theme. The player has no theme at all (see colors.ts) and never sets
 * `data-theme`, so its generator passes `false` to skip emitting a dark
 * block that would otherwise sit dead in the bundle.
 */
export function generateTokenCss({ includeDarkTheme = true }: { includeDarkTheme?: boolean } = {}): string {
  const colorVars = buildColorVariables();
  const roundedVars = buildRoundedVariables();
  const spacingVars = buildSpacingVariables();

  const blocks = [toCssBlock(':root', { ...colorVars.root, ...roundedVars, ...spacingVars })];
  if (includeDarkTheme) {
    blocks.push(toCssBlock('[data-theme="dark"]', colorVars.dark));
  }
  return blocks.join('\n\n');
}
