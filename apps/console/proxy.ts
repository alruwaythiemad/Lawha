import { NextResponse } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';
import { LOCALE_COOKIE_NAME, pickLocaleFromAcceptLanguage } from './app/locale-cookie';

// Next.js 16 renamed the middleware.ts convention to proxy.ts (same
// clerkMiddleware() function, different file/export convention —
// node_modules/next/dist/docs/.../proxy.md).
//
// Current Clerk guidance (verified against live docs, not training data)
// deprecates createRouteMatcher()/auth.protect() *inside* proxy for route
// protection — "protect access as close to the resource as possible."
// This file's main job is to attach Clerk's auth context to every request
// (required for auth()/auth.protect() to work downstream at all); the
// actual gate lives in app/(console)/layout.tsx via auth.protect() there.
// This also sidesteps the known upstream issue (clerk/javascript#8302)
// where auth.protect() called from inside proxy.ts can redirect to the
// current URL instead of the sign-in page under some Next 16 configs —
// calling protect() in the layout instead of here avoids it entirely.
//
// Story 1.7 AC2: this is also the *only* framework-sanctioned place that
// can persist a first-visit Accept-Language guess into the locale cookie.
// Next's docs are explicit that cookies().set() only works in a Server
// Action or Route Handler, never during Server Component rendering — so
// app/locale-cookie.ts's resolveLocale() (called from every layout/page,
// all Server Components) can compute the right value per-request but can't
// itself make that resolution "stick" into a cookie. Proxy runs before any
// of those renders and, per Next's own "Using Cookies" proxy example, is
// the documented way to seed a cookie from request headers. Signed-in
// requests are skipped here on purpose: a workspace's persisted language
// (AC1, resolved instead in app/(console)/layout.tsx from the
// already-fetched Workspace) must outrank a header guess, and this file
// never touches the service-role-only workspace repository (AD-27) to make
// that comparison — so it only ever writes the Accept-Language fallback
// for requests with no signed-in Clerk session at all.
export default clerkMiddleware(async (auth, request) => {
  const response = NextResponse.next();

  if (!request.cookies.has(LOCALE_COOKIE_NAME)) {
    const { userId } = await auth();
    if (!userId) {
      const locale = pickLocaleFromAcceptLanguage(request.headers.get('accept-language'));
      response.cookies.set(LOCALE_COOKIE_NAME, locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 400,
        sameSite: 'lax',
      });
    }
  }

  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|cur|heic|heif|webmanifest))(?:.*)|api|trpc)(.*)',
  ],
};
