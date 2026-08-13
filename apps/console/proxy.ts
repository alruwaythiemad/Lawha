import { clerkMiddleware } from '@clerk/nextjs/server';

// Next.js 16 renamed the middleware.ts convention to proxy.ts (same
// clerkMiddleware() function, different file/export convention —
// node_modules/next/dist/docs/.../proxy.md).
//
// Current Clerk guidance (verified against live docs, not training data)
// deprecates createRouteMatcher()/auth.protect() *inside* proxy for route
// protection — "protect access as close to the resource as possible."
// This file's only job is to attach Clerk's auth context to every request
// (required for auth()/auth.protect() to work downstream at all); the
// actual gate lives in app/(console)/layout.tsx via auth.protect() there.
// This also sidesteps the known upstream issue (clerk/javascript#8302)
// where auth.protect() called from inside proxy.ts can redirect to the
// current URL instead of the sign-in page under some Next 16 configs —
// calling protect() in the layout instead of here avoids it entirely.
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|cur|heic|heif|webmanifest))(?:.*)|api|trpc)(.*)',
  ],
};
