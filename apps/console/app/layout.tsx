import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { directionForLocale, format } from '@lawha/i18n';
import { resolveLocale } from './locale-cookie';
import { resolveTheme } from './theme-cookie';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  return {
    title: format(locale, 'common.appName'),
  };
}

// AD-21: lang/dir/data-theme are derived once, here, at the root — no
// descendant component branches on locale or theme to decide its own
// layout. `data-theme` is read here, server-side, so the very first
// response already carries the right value (Story 1.3, Task 4) — no flash
// of the wrong theme. The switcher UI that writes both cookies is Story
// 1.3 (app/(console)/language-switch.tsx, theme-switch.tsx); real
// per-user, cross-device language persistence is Story 1.7 — this
// cookie is only the browser-level half (theme has no such follow-up:
// this cookie is its complete mechanism).
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, theme] = await Promise.all([resolveLocale(), resolveTheme()]);

  return (
    <html lang={locale} dir={directionForLocale(locale)} data-theme={theme}>
      <body>
        {/* Composes with, not around, the lang/dir/data-theme derivation
            above (AD-21) — ClerkProvider introduces no locale source of
            its own; the Clerk hosted UI renders in English regardless
            (FR53 exception, see sign-in/sign-up pages). */}
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
