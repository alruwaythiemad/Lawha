import { describe, expect, it } from 'vitest';
import { allTypographyTiers, TIERS_EXEMPT_FROM_ARABIC_RAMP } from '../src/typography';

describe('Arabic ramp rule', () => {
  const latinBaseTiers = Object.entries(allTypographyTiers)
    .filter(([name, tier]) => tier.fontFamily === 'Inter' && !name.endsWith('-ar'))
    .map(([name]) => name)
    .filter((name) => !(TIERS_EXEMPT_FROM_ARABIC_RAMP as readonly string[]).includes(name));

  it('has at least one Latin tier to check (fails loudly if the token set goes empty)', () => {
    expect(latinBaseTiers.length).toBeGreaterThan(0);
  });

  it.each(latinBaseTiers)('tier "%s" has a corresponding -ar counterpart', (name) => {
    const counterpart = allTypographyTiers[`${name}-ar` as keyof typeof allTypographyTiers];
    expect(counterpart, `expected "${name}-ar" to exist`).toBeDefined();
    expect(counterpart.fontFamily).toBe('Cairo');
    expect(counterpart.letterSpacing).toBe('0');
  });

  it('never renders Arabic in the Latin family', () => {
    for (const [name, tier] of Object.entries(allTypographyTiers)) {
      if (name.endsWith('-ar')) {
        expect(tier.fontFamily, `"${name}" must use Cairo`).toBe('Cairo');
      }
    }
  });

  it('exempted tiers (numeric, code-console, player-code) stay Inter with no -ar sibling', () => {
    for (const name of TIERS_EXEMPT_FROM_ARABIC_RAMP) {
      expect(allTypographyTiers[name].fontFamily).toBe('Inter');
      expect(`${name}-ar` in allTypographyTiers).toBe(false);
    }
  });

  it.each(latinBaseTiers)('tier "%s" itself stays on Inter, never Cairo', (name) => {
    expect(allTypographyTiers[name as keyof typeof allTypographyTiers].fontFamily).toBe('Inter');
  });
});
