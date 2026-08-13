'use server';

import type { Locale } from '@lawha/i18n';
import { setLocale } from '../locale-cookie';
import { setTheme, type Theme } from '../theme-cookie';
import { updateWorkspaceLanguage } from '../../lib/workspace-bootstrap';
import { resolveWorkspaceContext } from '../../lib/workspace-context';

// The Server Action boundary Client Components call (language-switch.tsx,
// theme-switch.tsx) — invoking one of these from a Client Component
// refreshes the server-rendered tree with no full page reload (AC4).
//
// Story 1.7 Task 6: the cookie write stays synchronous and unconditional
// (existing AC4 behavior — the current tab reflects the change
// immediately, cookie-fast-path unaffected by whatever happens next), then
// the same Server Action also persists to the workspace (AC1) — a direct
// function call rather than an internal HTTP round-trip to Task 4's PATCH
// route, which still exists and is exercised directly for the
// cross-device proof (Task 7). Returns whether the workspace write
// succeeded so the caller can roll back per EXPERIENCE.md's Settings
// "save failure rolls back" rule — the cookie itself doesn't need
// reverting by this function, since a caller-driven rollback is just
// another call to this same action with the previous locale.
export async function setLocaleAction(locale: Locale): Promise<{ persisted: boolean }> {
  // Review fix: a Server Action is directly invocable over the network
  // with an arbitrary body regardless of the `Locale` compile-time type —
  // this mirrors Task 4's PATCH route's runtime guard so this action can't
  // persist a value the route handler would reject.
  if (locale !== 'en' && locale !== 'ar') {
    return { persisted: false };
  }

  await setLocale(locale);

  try {
    const { workspaceId } = await resolveWorkspaceContext();
    await updateWorkspaceLanguage(workspaceId, locale);
    return { persisted: true };
  } catch {
    return { persisted: false };
  }
}

export async function setThemeAction(theme: Theme): Promise<void> {
  await setTheme(theme);
}
