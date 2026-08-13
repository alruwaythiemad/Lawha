import type { Config } from 'tailwindcss';
import { tailwindColorTheme, tailwindRoundedTheme, tailwindSpacingTheme } from '@lawha/tokens';

// Colors/radius/spacing come entirely from @lawha/tokens (as var(--...)
// references, so the [data-theme="dark"] substitution in generated/tokens.css
// reaches every Tailwind utility) — no literal here, per AC1/AC4.
//
// Deliberate: `theme` here, not `theme.extend`. This replaces Tailwind's
// entire default color/radius/spacing scale rather than adding to it, so
// every default utility that isn't token-derived (`gap-4`, `w-8`, `p-2`,
// etc.) generates no CSS at all — silently, with no lint or type error.
// That's intentional: it forces every color/radius/spacing usage through
// the token set, which is what AC1 asks for. If you reach for a default
// Tailwind utility and it does nothing, this is why — use a token-named
// class (see packages/tokens) or `var(--...)` directly instead.
export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    colors: tailwindColorTheme,
    borderRadius: tailwindRoundedTheme,
    spacing: tailwindSpacingTheme,
  },
} satisfies Config;
