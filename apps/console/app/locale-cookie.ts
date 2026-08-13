import { cookies, headers } from 'next/headers';
import type { Locale } from '@lawha/i18n';

export const LOCALE_COOKIE_NAME = 'lawha-locale';

function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'ar';
}

// AC2's first-visit fallback: Accept-Language is a preference-ordered list
// like "ar,en;q=0.8" — pick the highest-weighted tag and check whether it's
// Arabic. Exported so proxy.ts's pre-render fallback (Node runtime, the
// only place a locale cookie can be *written* for a request that has none
// yet — see resolveLocale's own doc comment below) can compute the exact
// same value from the exact same header, keeping the two call sites from
// ever picking different locales for the same request.
export function pickLocaleFromAcceptLanguage(acceptLanguageHeader: string | null): Locale {
  if (!acceptLanguageHeader) return 'en';
  const preferred = acceptLanguageHeader
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: tag.toLowerCase(), q: Number.isNaN(q) ? 1 : q };
    })
    .sort((a, b) => b.q - a.q);
  return preferred[0]?.tag.startsWith('ar') ? 'ar' : 'en';
}

// AD-21's root derivation (Task 2 of Story 1.3), extended by Story 1.7 for
// real per-user, cross-device persistence (FR46/AC1) plus the honest
// first-visit-only Accept-Language fallback (AC2).
//
// Resolution order: (a) `workspaceLanguage` supplied by the caller
// (apps/console/app/(console)/layout.tsx and every console page already
// have the signed-in owner's Workspace on hand from
// ensureWorkspaceForClerkUser/resolveSignedInWorkspace, so they pass
// workspace.language in — this file deliberately does not call auth()/the
// workspace repository itself, keeping it framework/vendor agnostic beyond
// next/headers) → use that; a signed-in owner's persisted record outranks
// everything else, including a cookie, since the cookie can hold a stale
// pre-auth Accept-Language guess written by proxy.ts before this owner
// ever had a session (AC1 depends on this taking priority); (b) no
// workspaceLanguage (unauthenticated request), cookie present → use it;
// (c) neither → parse Accept-Language once via headers() and use that.
//
// Cookie-writing note (read this before "fixing" the missing .set() call
// below): Next's own docs are explicit — "Setting cookies is not supported
// during Server Component rendering... invoke a Server Function or use a
// Route Handler." Every call site of this function *except* Task 4's PATCH
// route and withApiErrorHandling's Route-Handler wrapper is a Server
// Component (this app's layouts and pages), so this function cannot itself
// persist a fallback resolution into the cookie the way a naive reading of
// this story's Task 5 would suggest — attempting cookieStore.set() here
// would throw for every page/layout call site. Two consequences, both
// deliberate and documented rather than silent gaps:
//   1. For a signed-in owner with no cookie yet, correctness doesn't depend
//      on ever writing one — resolution order (a) re-derives the same
//      correct value, from the workspace, on every request. The cookie is
//      purely a performance fast path here, populated for real the next
//      time Task 6's Server Action (setLocaleAction) runs, which *can*
//      write cookies.
//   2. For a first-time, pre-auth visitor (no cookie, no session), AC2's
//      "never consulted again" genuinely requires the cookie to exist
//      before the *next* request — so that half of the fallback is handled
//      in apps/console/proxy.ts instead (the Node-runtime, pre-render
//      boundary Next.js designs exactly for this kind of case), using this
//      same pickLocaleFromAcceptLanguage function so the two never drift.
export async function resolveLocale(workspaceLanguage?: Locale): Promise<Locale> {
  // AC1 fix: a signed-in owner's persisted workspace preference must
  // outrank the cookie, not just fall back to it. The cookie can already
  // hold a stale pre-auth guess written by proxy.ts's unauthenticated
  // Accept-Language fallback (seeded on the sign-in page itself, before
  // this owner ever had a session) — trusting that guess over the DB
  // record it is this function's whole job to honor is exactly how AC1's
  // cross-device guarantee breaks. Only callers with a signed-in workspace
  // on hand pass this argument; the pre-auth path (AC2) never does, so the
  // cookie/Accept-Language tiers below are untouched for that case.
  if (isLocale(workspaceLanguage)) return workspaceLanguage;

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (isLocale(cookieValue)) return cookieValue;

  const headerList = await headers();
  return pickLocaleFromAcceptLanguage(headerList.get('accept-language'));
}

// Write side (Story 1.3, extended by Story 1.7's Task 6 which now also
// persists to the workspace — this function remains the cookie-only half).
// Setting the cookie from a Server Action and letting the calling Client
// Component await it naturally refreshes the server-rendered tree (this
// file's resolveLocale re-runs) with no full page reload — that refresh is
// AC4, not something this function does itself.
export async function setLocale(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, { path: '/', maxAge: 60 * 60 * 24 * 400, sameSite: 'lax' });
}
