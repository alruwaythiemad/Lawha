import type { TypographyTier } from './typography';

/**
 * Emits one CSS class per typography tier, named `.{classPrefix}-{tierName}`
 * (default prefix `type`, deliberately not `text`, so these never collide
 * with Tailwind's own `text-*` color/size utility namespace). This is how
 * console and player each get their own, independently greppable set of
 * class names in build output — see scripts/verify-tier-isolation.ts.
 */
export function generateTypographyCss(
  tiers: Record<string, TypographyTier>,
  options?: { classPrefix?: string },
): string {
  const prefix = options?.classPrefix ?? 'type';
  return Object.entries(tiers)
    .map(([name, tier]) => {
      const fallback = tier.fontFamily === 'Cairo' ? "'Cairo', sans-serif" : "'Inter', sans-serif";
      return [
        `.${prefix}-${name} {`,
        `  font-family: ${fallback};`,
        `  font-size: ${tier.fontSize};`,
        `  font-weight: ${tier.fontWeight};`,
        `  line-height: ${tier.lineHeight};`,
        `  letter-spacing: ${tier.letterSpacing};`,
        `}`,
      ].join('\n');
    })
    .join('\n\n');
}
