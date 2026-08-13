import { colors, type ColorName } from './colors';
import { allTypographyTiers, type TypographyTierName } from './typography';
import { rounded, type RoundedName } from './rounded';
import { spacing, type SpacingName } from './spacing';

const TABLES = { colors, typography: allTypographyTiers, rounded, spacing } as const;
type TableName = keyof typeof TABLES;

const TABLE_REF_RE = /\b(colors|typography|rounded|spacing)\.[\w-]+\b/g;

function resolveSingleRef(ref: string): string {
  const [table, ...rest] = ref.split('.');
  const name = rest.join('.');
  const entries = TABLES[table as TableName] as Record<string, unknown>;
  const value = entries[name];
  return typeof value === 'string' ? value : JSON.stringify(value);
}

/**
 * Resolves `{table.name}` references — the literal reference syntax
 * transcribed verbatim from DESIGN.md's components block — against the
 * underlying token tables. Component definitions keep the symbolic
 * reference (e.g. `'colors.electric'`) rather than a pre-resolved hex so
 * the dark-theme CSS-variable substitution (Task 3) stays data-driven from
 * one source instead of needing a second, duplicated component table.
 *
 * `components.ts` mixes three shapes for these fields: a bare reference
 * (`'colors.electric'`), several references joined by whitespace as a CSS
 * shorthand (`'spacing.control-pad-block spacing.control-pad-inline'`), and
 * a literal prefixed/suffixed onto a reference (`'8px spacing.row-pad-inline'`,
 * `'2px solid colors.electric'`). All three resolve here by replacing every
 * `table.name` token found in the string, leaving surrounding literal text
 * untouched. A typography-tier ref resolves to its JSON-stringified object,
 * same as a single bare ref did previously.
 *
 * Two things this deliberately does NOT handle, because nothing in this
 * story consumes them: freeform descriptive text with no `table.name`
 * pattern in it (e.g. `'outer 10% of one corner'`) and `components.*`
 * self-references (e.g. `'components.focus-ring-on-signal'` in
 * `banner-alarm.focus`) — `components` isn't in `TABLES`, so those still
 * throw, same as before this fix. Resolving component-to-component
 * composition is a bigger design question left to whichever story first
 * needs to consume it.
 */
export function resolveTokenRef(ref: string): string {
  const matches = ref.match(TABLE_REF_RE);
  if (!matches) {
    throw new Error(`Unresolvable token reference: "${ref}"`);
  }
  for (const match of matches) {
    const [table, ...rest] = match.split('.');
    const name = rest.join('.');
    const entries = TABLES[table as TableName] as Record<string, unknown>;
    if (!(name in entries)) {
      throw new Error(`Unresolvable token reference: "${ref}"`);
    }
  }
  if (matches.length === 1 && matches[0] === ref) {
    return resolveSingleRef(ref);
  }
  return matches.reduce((result, match) => result.replace(match, resolveSingleRef(match)), ref);
}

export type ColorRef = `colors.${ColorName}`;
export type TypographyRef = `typography.${TypographyTierName}`;
export type RoundedRef = `rounded.${RoundedName}`;
export type SpacingRef = `spacing.${SpacingName}`;
