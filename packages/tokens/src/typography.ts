// Verbatim transcription of DESIGN.md § typography. Console tiers are px,
// player tiers are vmin — the two sets are exported separately and must
// never overlap (see consoleTypography / playerTypography below).

export interface TypographyTier {
  fontFamily: 'Inter' | 'Cairo';
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
}

/**
 * Tiers exempt from the Arabic ramp rule: numerals and pairing codes are
 * alphanumeric, not translated prose, so they have no `-ar` counterpart —
 * this is DESIGN.md's own carve-out ("Numerals always render in Inter ...
 * in BOTH locales"), not an oversight the unit test should flag.
 */
export const TIERS_EXEMPT_FROM_ARABIC_RAMP = ['numeric', 'code-console', 'player-code'] as const;

export const consoleTypography = {
  display: {
    fontFamily: 'Inter',
    fontSize: '24px',
    fontWeight: '800',
    lineHeight: '1.05',
    letterSpacing: '-0.035em',
  },
  'display-ar': {
    fontFamily: 'Cairo',
    fontSize: '24px',
    fontWeight: '800',
    lineHeight: '1.4',
    letterSpacing: '0',
  },
  heading: {
    fontFamily: 'Inter',
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },
  'heading-ar': {
    fontFamily: 'Cairo',
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: '1.55',
    letterSpacing: '0',
  },
  body: {
    fontFamily: 'Inter',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.5',
    letterSpacing: '0',
  },
  'body-ar': {
    fontFamily: 'Cairo',
    fontSize: '15px',
    fontWeight: '500',
    lineHeight: '1.7',
    letterSpacing: '0',
  },
  'body-sm': {
    fontFamily: 'Inter',
    fontSize: '13px',
    fontWeight: '500',
    lineHeight: '1.45',
    letterSpacing: '0',
  },
  'body-sm-ar': {
    fontFamily: 'Cairo',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.65',
    letterSpacing: '0',
  },
  label: {
    fontFamily: 'Inter',
    fontSize: '10px',
    fontWeight: '800',
    lineHeight: '1',
    letterSpacing: '0.16em',
  },
  'label-ar': {
    fontFamily: 'Cairo',
    fontSize: '11px',
    fontWeight: '800',
    lineHeight: '1.35',
    letterSpacing: '0',
  },
  numeric: {
    fontFamily: 'Inter',
    fontSize: '13px',
    fontWeight: '500',
    lineHeight: '1',
    letterSpacing: '0',
  },
  'code-console': {
    fontFamily: 'Inter',
    fontSize: '32px',
    fontWeight: '800',
    lineHeight: '1',
    letterSpacing: '0.14em',
  },
} as const satisfies Record<string, TypographyTier>;

export const playerTypography = {
  'player-code': {
    fontFamily: 'Inter',
    fontSize: '5.2vmin',
    fontWeight: '800',
    lineHeight: '1',
    letterSpacing: '0.1em',
  },
  'player-headline': {
    fontFamily: 'Inter',
    fontSize: '2.4vmin',
    fontWeight: '800',
    lineHeight: '1.1',
    letterSpacing: '-0.03em',
  },
  'player-headline-ar': {
    fontFamily: 'Cairo',
    fontSize: '2.4vmin',
    fontWeight: '800',
    lineHeight: '1.45',
    letterSpacing: '0',
  },
  'player-body': {
    fontFamily: 'Inter',
    fontSize: '1.4vmin',
    fontWeight: '500',
    lineHeight: '1.5',
    letterSpacing: '0',
  },
  'player-body-ar': {
    fontFamily: 'Cairo',
    fontSize: '1.5vmin',
    fontWeight: '500',
    lineHeight: '1.7',
    letterSpacing: '0',
  },
  'player-label': {
    fontFamily: 'Inter',
    fontSize: '1.0vmin',
    fontWeight: '800',
    lineHeight: '1',
    letterSpacing: '0.18em',
  },
  'player-label-ar': {
    fontFamily: 'Cairo',
    fontSize: '1.1vmin',
    fontWeight: '800',
    lineHeight: '1.35',
    letterSpacing: '0',
  },
} as const satisfies Record<string, TypographyTier>;

export type ConsoleTypographyTierName = keyof typeof consoleTypography;
export type PlayerTypographyTierName = keyof typeof playerTypography;

/**
 * Combined map for tooling only (the Arabic-counterpart unit test and the
 * CSS-variable generator) — apps must import consoleTypography or
 * playerTypography directly, never this, or the two unit sets stop being
 * non-overlapping in practice.
 */
export const allTypographyTiers = {
  ...consoleTypography,
  ...playerTypography,
} as const satisfies Record<string, TypographyTier>;

export type TypographyTierName = keyof typeof allTypographyTiers;

const overlap = Object.keys(consoleTypography).filter((key) => key in playerTypography);
if (overlap.length > 0) {
  throw new Error(`Console and player typography tiers must not overlap: ${overlap.join(', ')}`);
}
